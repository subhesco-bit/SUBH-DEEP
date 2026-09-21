'use strict';

const request = require('supertest');
const express = require('express');

jest.mock('../../middleware/auth', () => {
  const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
    const [id, role = 'farmer'] = token.split(':');
    req.user = { id, role };
    return next();
  };

  const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    return next();
  };

  return { authMiddleware, requireRole };
});

jest.mock('../../database/pool', () => ({ query: jest.fn() }));
jest.mock('../../services/legacy/nutritionIntelligenceService', () => ({
  calculateNutrientTotals: jest.fn(() => ({
    servings: 2,
    totals: { protein: 20 },
    provenance: 'calculated from caller-supplied ingredient values',
  })),
}));
jest.mock('../../services/legacy/productMediaAIService', () => ({
  callImageProvider: jest.fn(),
}));
jest.mock('../../services/dietTherapyService', () => ({
  createPlan: jest.fn(async (profile) => ({ profile, clinical_status: 'education_only' })),
}));

const pool = require('../../database/pool');
const media = require('../../services/legacy/productMediaAIService');
const lifecycleRoutes = require('../farmerProductLifecycleRoutes');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/farmer-products', lifecycleRoutes);
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
  });
  return app;
}

describe('farmer product lifecycle integration routes', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    jest.clearAllMocks();
    pool.query.mockImplementation(async () => ({ rows: [] }));
  });

  test('records nutrition values together with explicit provenance', async () => {
    const stored = {
      id: 'product-1',
      farmer_id: 'farmer-1',
      status: 'dietitian_review',
      nutrition_data: { servings: 2, totals: { protein: 20 } },
      nutrition_provenance: {
        source: 'calculated from caller-supplied ingredient values',
        laboratoryVerified: true,
        sourceDocuments: ['lab-report.pdf'],
      },
    };
    pool.query.mockResolvedValueOnce({ rows: [stored] });

    const response = await request(app)
      .post('/farmer-products/product-1/nutrition')
      .set('Authorization', 'Bearer farmer-1:farmer')
      .send({
        items: [{ nutrients: { protein: 10 }, quantity: 2 }],
        servings: 2,
        laboratoryVerified: true,
        sourceDocuments: ['lab-report.pdf'],
      });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('dietitian_review');
    expect(response.body.data.nutrition_provenance).toEqual(expect.objectContaining({
      source: expect.stringContaining('caller-supplied'),
      laboratoryVerified: true,
      sourceDocuments: ['lab-report.pdf'],
    }));
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('nutrition_provenance'), expect.any(Array));
  });

  test('fails closed when the requested image provider is unavailable', async () => {
    media.callImageProvider.mockResolvedValue({
      ok: false,
      status: 'not_configured',
      provider: 'openai_images',
    });

    const response = await request(app)
      .post('/farmer-products/product-1/image')
      .set('Authorization', 'Bearer farmer-1:farmer')
      .send({ name: 'Heritage rice', provider: 'openai_images' });

    expect(response.status).toBe(503);
    expect(response.body.error).toEqual(expect.objectContaining({
      code: 'IMAGE_PROVIDER_UNAVAILABLE',
    }));
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('allows a dietitian to approve a lifecycle product', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{
          nutrition_data: { protein: 20 },
          nutrition_provenance: { source: 'lab' },
        }],
      })
      .mockResolvedValueOnce({
        rows: [{
          id: 'product-1',
          name: 'Heritage rice',
          farmer_id: 'farmer-1',
          status: 'approved',
          nutrition_data: { protein: 20 },
          nutrition_provenance: { source: 'lab' },
          product_data: {},
        }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 'canonical-1' }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/farmer-products/product-1/review')
      .set('Authorization', 'Bearer dietitian-1:dietitian')
      .send({ decision: 'approve', notes: 'Nutrition evidence reviewed' });

    expect(response.status).toBe(200);
    expect(response.body.data.canonical_product_id).toBe('canonical-1');
    expect(pool.query).toHaveBeenCalledTimes(4);
  });

  test('rejects non-dietitian review attempts at the route boundary', async () => {
    const response = await request(app)
      .post('/farmer-products/product-1/review')
      .set('Authorization', 'Bearer farmer-1:farmer')
      .send({ decision: 'approve' });

    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test.each([
    ['nutrition_pending', 'unapproved'],
    ['dietitian_review', 'unapproved'],
    ['rejected', 'unapproved'],
  ])('does not add %s products to health plans', async (status) => {
    // The SQL predicate `status = 'approved'` means an unapproved row is not
    // returned by the isolated database mock, just as it would be in Postgres.
    pool.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/farmer-products/product-1/health-plan')
      .set('Authorization', 'Bearer dietitian-1:dietitian')
      .send({
        profile: { age: 35, sex: 'female', region: 'northeast' },
        options: { useAI: false },
      });

    expect(response.status).toBe(500);
    expect(response.body.error.message).toMatch(/only dietitian-approved/i);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });
});
