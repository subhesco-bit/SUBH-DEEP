// Jest setup file for backend
const { Pool } = require('pg');

// Tests must use an explicit deterministic secret, never a production secret.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-jwt-secret-not-for-production';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-only-session-secret-not-for-production';

// Test database setup
let testPool;

beforeAll(async () => {
  // Setup test database connection
  testPool = new Pool({
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    database: process.env.TEST_DB_NAME || 'afrera_test',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
  });
});

afterAll(async () => {
  // Cleanup test database connection
  await testPool.end();
});

// Global test utilities
global.testPool = testPool;

// Mock external services. These legacy service files are not always present in
// slimmed module-only checkouts, so keep the setup virtual and non-fatal.
jest.mock('./services/aiService', () => ({}), { virtual: true });
jest.mock('./services/conversationalAIService', () => ({}), { virtual: true });
