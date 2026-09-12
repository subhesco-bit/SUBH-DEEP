/**
 * GDPR Routes - GDPR Compliance API Endpoints
 *
 * Recovered from the old-new-folder dump — real file, real backing
 * service (services/dual-use/gdprService.js, exact method-name matches),
 * never copied into the live routes/ tree or mounted. Mounted at
 * /api/v1/privacy (not /api/v1/privacy-settings, which
 * privacyDomainRoutes.js already owns for the simpler consent-only
 * endpoint) - no path collision, this file is the fuller GDPR surface
 * (RTBF, data export, residency checks, PIA, policy text).
 */

const express = require('express');
const router = express.Router();
const gdprService = require('../services/dual-use/gdprService');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

router.post('/consent', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { consentType, consentGiven } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const consentRecord = await gdprService.recordConsent(
      userId,
      consentType,
      consentGiven,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      data: consentRecord,
      message: 'Consent recorded successfully'
    });
  } catch (error) {
    console.error('Consent recording error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record consent'
    });
  }
});

router.get('/consent/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== parseInt(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied'
      });
    }

    const consentData = await gdprService.getUserConsent(userId);

    res.json({
      success: true,
      data: consentData
    });
  } catch (error) {
    console.error('Get consent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get consent data'
    });
  }
});

router.post('/rtbf', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { reason } = req.body;
    const requestId = `RTBF-${Date.now()}-${userId}`;

    const result = await gdprService.rightToBeForgotten(userId, reason, requestId);

    res.json(result);
  } catch (error) {
    console.error('Right to be forgotten error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process right to be forgotten'
    });
  }
});

router.get('/export/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'json' } = req.query;

    if (req.user.id !== parseInt(userId) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied'
      });
    }

    const exportData = await gdprService.exportUserData(userId, format);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=user_data_${userId}.json`);
      res.send(exportData);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=user_data_${userId}.csv`);
      res.send(exportData);
    } else {
      res.json({
        success: true,
        data: exportData
      });
    }
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export user data'
    });
  }
});

router.get('/data-residency/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { dataRegion = 'IN' } = req.query;

    const complianceCheck = await gdprService.checkDataResidency(userId, dataRegion);

    res.json({
      success: true,
      data: complianceCheck
    });
  } catch (error) {
    console.error('Data residency check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check data residency'
    });
  }
});

router.post('/privacy-impact-assessment', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { systemComponent, dataTypes, processingPurpose } = req.body;

    const assessment = await gdprService.conductPrivacyImpactAssessment(
      systemComponent,
      dataTypes,
      processingPurpose
    );

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Privacy impact assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to conduct privacy impact assessment'
    });
  }
});

router.get('/policy', async (req, res) => {
  try {
    const privacyPolicy = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      principles: [
        'Lawfulness, fairness, and transparency',
        'Purpose limitation',
        'Data minimization',
        'Accuracy',
        'Storage limitation',
        'Integrity and confidentiality',
        'Accountability'
      ],
      userRights: [
        'Right to be informed',
        'Right of access',
        'Right to rectification',
        'Right to erasure (right to be forgotten)',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object'
      ],
      dataRetention: {
        'personalData': '5 years after account closure',
        'transactionData': '7 years for legal compliance',
        'analyticsData': '2 years'
      },
      contact: {
        'email': 'privacy@afrera.com',
        'address': 'AFRERA Privacy Office, Assam, India'
      }
    };

    res.json({
      success: true,
      data: privacyPolicy
    });
  } catch (error) {
    console.error('Get privacy policy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get privacy policy'
    });
  }
});

module.exports = router;
