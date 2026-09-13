/**
 * Database Connection Manager
 * Supports PostgreSQL (relational) and MongoDB (document) databases
 */

const { Pool } = require('pg');
const { logger } = require('../utils/logger');

/**
 * The MongoDB driver is loaded on first use, not at import time.
 *
 * WHY THIS IS NOT A MICRO-OPTIMISATION
 *
 * `require('mongodb')` pulls in ~130 files and costs about twelve seconds on
 * this machine. Twenty-two services import this module for `getPostgreSQL`
 * alone; MongoDB is touched by exactly one (`aiBackboneService`, for fraud patterns).
 * So every one of them — and every process that loads any of them — paid the
 * full driver cost to use PostgreSQL.
 *
 * In the test suite that is the dominant cost of the whole run: fifteen suites
 * each `require('../index')`, each boot takes ~29s, and 12s of that is a Mongo
 * driver the tests explicitly mock to `null` and never connect. Roughly three
 * minutes per run spent loading a database nobody is talking to.
 *
 * Deferring the require does not change behaviour. `initMongoDB()` is the only
 * thing that constructs a client, and it now loads the driver immediately
 * before doing so — a connection that used to work still works, and it fails
 * the same way if the driver is genuinely missing. What changes is that a
 * process which never opens a Mongo connection never pays for the driver.
 */
let MongoClient = null;
function loadMongoDriver() {
  if (!MongoClient) {
    // eslint-disable-next-line global-require
    ({ MongoClient } = require('mongodb'));
  }
  return MongoClient;
}

// PostgreSQL connection pool
let pgPool = null;

// MongoDB client
let mongoClient = null;
let mongoConnected = false;
let initializationError = null;
let mongoInitializationError = null;
let initializationCompleted = false;

/**
 * Initialize PostgreSQL connection
 */
async function initPostgreSQL() {
  try {
    // DATABASE_URL takes precedence when present.
    //
    // Managed platforms (Railway, Heroku, Render, Fly, Supabase) inject
    // DATABASE_URL and nothing else. This file previously read only PG_* vars,
    // so on any of them it would quietly fall back to
    // localhost:5432/afrera_db as postgres/password — connect to nothing, and
    // report "PostgreSQL connection failed" as if the database were down
    // rather than as if it had never been told where to look.
    //
    // PG_* still works and is what CI supplies, so both paths are supported.
    const pgConfig = process.env.DATABASE_URL ?
      { connectionString: process.env.DATABASE_URL } :
      {
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT, 10) || 5432,
        database: process.env.PG_DATABASE || 'afrera_db',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'password',
      };

    // Managed Postgres almost always requires TLS, and its certificates are
    // usually not in the container's trust store. Opt in explicitly rather
    // than defaulting rejectUnauthorized to false everywhere.
    if (process.env.PG_SSL === 'true') {
      pgConfig.ssl = { rejectUnauthorized: process.env.PG_SSL_STRICT !== 'false' };
    }

    pgPool = new Pool({
      ...pgConfig,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pgPool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('PostgreSQL connection established successfully');
    return pgPool;
  } catch (error) {
    logger.error('PostgreSQL connection failed', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Initialize MongoDB connection
 */
async function initMongoDB() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/afrera_mongo';
    const Client = loadMongoDriver();
    mongoClient = new Client(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await mongoClient.connect();
    await mongoClient.db('admin').command({ ping: 1 });

    mongoConnected = true;
    logger.info('MongoDB connection established successfully');
    return mongoClient;
  } catch (error) {
    mongoConnected = false;
    logger.error('MongoDB connection failed', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Initialize all database connections.
 *
 * PostgreSQL is the authoritative datastore for most of the platform, so its
 * failure is treated as a real initialization error. MongoDB is used by
 * exactly one service (aiBackboneService, for fraud patterns) and is
 * deliberately optional: a Mongo failure is logged and tracked on its own
 * (mongoInitializationError / isHealthy().mongodb) without flipping
 * initializationError or fallback mode for the whole platform.
 */
async function initialize() {
  if (initializationCompleted) {
    return { pgPool, mongoClient };
  }

  try {
    await initPostgreSQL();
    initializationError = null;
  } catch (error) {
    initializationError = error;
    logger.warn('PostgreSQL initialization failed; continuing in fallback mode', { error: error.message });
  }

  try {
    await initMongoDB();
    mongoInitializationError = null;
  } catch (error) {
    mongoInitializationError = error;
    logger.warn('MongoDB initialization failed; continuing without MongoDB (optional datastore)', { error: error.message });
  }

  initializationCompleted = true;
  if (!initializationError && !mongoInitializationError) {
    logger.info('All database connections initialized');
  }
  return { pgPool, mongoClient };
}

/**
 * Get PostgreSQL pool
 */
function getPostgreSQL() {
  if (!pgPool) {
    return null;
  }
  return pgPool;
}

/**
 * Get MongoDB client
 */
function getMongoDB() {
  if (!mongoClient) {
    throw new Error('MongoDB not initialized. Call initialize() first.');
  }
  return mongoClient;
}

/**
 * Get MongoDB database
 */
function getMongoDatabase() {
  const dbName = process.env.MONGO_DATABASE || 'afrera_mongo';
  return mongoClient.db(dbName);
}

/**
 * Health check for databases
 */
function isHealthy() {
  const pgHealthy = pgPool !== null && initializationError === null;
  const mongoHealthy = mongoClient !== null && mongoConnected;
  return {
    postgresql: pgHealthy,
    mongodb: mongoHealthy,
    // PostgreSQL is the authoritative datastore; MongoDB is optional (used by
    // exactly one service), so overall health does not depend on it.
    overall: pgHealthy,
    fallback: initializationError !== null,
  };
}

/**
 * Close all database connections
 */
async function close() {
  try {
    if (pgPool) {
      await pgPool.end();
      logger.info('PostgreSQL connection closed');
    }
    if (mongoClient) {
      await mongoClient.close();
      mongoConnected = false;
      logger.info('MongoDB connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connections', { error: error.message, stack: error.stack });
    throw error;
  }
}

// Initialize on module load if not in test mode
if (process.env.NODE_ENV !== 'test') {
  initialize().catch(error => {
    logger.warn('Database initialization deferred to fallback mode', { error: error.message });
  });
}

module.exports = {
  initialize,
  getPostgreSQL,
  getMongoDB,
  getMongoDatabase,
  isHealthy,
  close,
};

