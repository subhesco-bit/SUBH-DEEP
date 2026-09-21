/**
 * Database Connection Manager - FIXED
 * Properly handles PostgreSQL, MongoDB, and Redis connections
 */

'use strict';

const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

const DB_CONFIG = {
  postgresql: {
    host: process.env.DB_HOST || process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.PG_PORT || 5432),
    database: process.env.DB_NAME || process.env.PG_DATABASE || 'afrera',
    user: process.env.DB_USER || process.env.PG_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.PG_PASSWORD || 'password',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  mongodb: {
    uri: process.env.MONGO_URI || null,
    database: process.env.MONGO_DATABASE || 'afrera_mongo',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB || 0),
  },
};

// ============================================================================
// CONNECTION POOL STATE
// ============================================================================

let pgPool = null;
let mongoClient = null;
let redisClient = null;
let mongoConnected = false;
let redisConnected = false;
let dbInitialized = false;
let initializationError = null;

// ============================================================================
// POSTGRESQL CONNECTION
// ============================================================================

/**
 * Initialize PostgreSQL connection pool with retry logic
 */
async function initPostgreSQL() {
  try {
    const config = DB_CONFIG.postgresql;
    logger.info('🔗 Connecting to PostgreSQL...', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    });

    pgPool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000,
    });

    // Test connection
    let retries = 3;
    let connected = false;

    while (retries > 0 && !connected) {
      try {
        const client = await pgPool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        connected = true;
        logger.info('✅ PostgreSQL connected successfully');
      } catch (error) {
        retries--;
        if (retries > 0) {
          logger.warn(`⚠️  PostgreSQL connection failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }

    // Handle pool errors
    pgPool.on('error', (error) => {
      logger.error('❌ Unexpected PostgreSQL pool error:', error);
    });

    return pgPool;
  } catch (error) {
    logger.error('❌ PostgreSQL connection failed:', error.message);
    throw error;
  }
}

// ============================================================================
// MONGODB CONNECTION
// ============================================================================

let MongoClient = null;

function loadMongoDriver() {
  if (!MongoClient) {
    try {
      const mongodb = require('mongodb');
      MongoClient = mongodb.MongoClient;
    } catch (error) {
      logger.warn('⚠️  MongoDB driver not available:', error.message);
      return null;
    }
  }
  return MongoClient;
}

/**
 * Initialize MongoDB connection (optional)
 */
async function initMongoDB() {
  try {
    const uri = DB_CONFIG.mongodb.uri;

    if (!uri) {
      logger.info('ℹ️  MongoDB not configured (MONGO_URI not set)');
      return null;
    }

    const Client = loadMongoDriver();
    if (!Client) {
      logger.warn('⚠️  MongoDB driver not available');
      return null;
    }

    logger.info('🔗 Connecting to MongoDB...');

    mongoClient = new Client(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    });

    await mongoClient.connect();
    await mongoClient.db('admin').command({ ping: 1 });

    mongoConnected = true;
    logger.info('✅ MongoDB connected successfully');

    return mongoClient;
  } catch (error) {
    mongoConnected = false;
    logger.warn('⚠️  MongoDB connection failed (optional):', error.message);
    return null;
  }
}

// ============================================================================
// REDIS CONNECTION
// ============================================================================

/**
 * Initialize Redis connection (optional)
 */
async function initRedis() {
  try {
    let redis;
    try {
      redis = require('redis');
    } catch (error) {
      logger.warn('⚠️  Redis client not available');
      return null;
    }

    const config = DB_CONFIG.redis;
    logger.info('🔗 Connecting to Redis...');

    redisClient = redis.createClient({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max retries exceeded');
            return new Error('Max retries exceeded');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (error) => {
      logger.error('Redis error:', error.message);
      redisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected');
      redisConnected = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.warn('⚠️  Redis connection failed (optional):', error.message);
    return null;
  }
}

// ============================================================================
// MASTER INITIALIZATION
// ============================================================================

/**
 * Initialize all database connections
 */
async function initialize() {
  if (dbInitialized) {
    return { pgPool, mongoClient, redisClient };
  }

  try {
    // PostgreSQL is mandatory
    try {
      await initPostgreSQL();
      initializationError = null;
    } catch (error) {
      initializationError = error;
      logger.warn('⚠️  PostgreSQL initialization failed');
      // Don't throw - we'll continue with fallback mode
    }

    // MongoDB is optional
    await initMongoDB();

    // Redis is optional
    await initRedis();

    dbInitialized = true;
    logger.info('✅ Database initialization complete');

    return { pgPool, mongoClient, redisClient };
  } catch (error) {
    logger.error('Fatal database initialization error:', error);
    throw error;
  }
}

// ============================================================================
// GETTERS
// ============================================================================

/**
 * Get PostgreSQL pool
 */
function getPostgreSQL() {
  if (!pgPool) {
    logger.error('PostgreSQL pool not initialized');
    return null;
  }
  return pgPool;
}

/**
 * Get MongoDB client
 */
function getMongoDB() {
  if (!mongoClient || !mongoConnected) {
    return null;
  }
  return mongoClient;
}

/**
 * Get MongoDB database
 */
function getMongoDatabase() {
  if (!mongoClient || !mongoConnected) {
    return null;
  }
  return mongoClient.db(DB_CONFIG.mongodb.database);
}

/**
 * Get Redis client
 */
function getRedis() {
  if (!redisClient || !redisConnected) {
    return null;
  }
  return redisClient;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check database health
 */
function isHealthy() {
  return {
    postgresql: pgPool !== null && initializationError === null,
    mongodb: mongoClient !== null && mongoConnected,
    redis: redisClient !== null && redisConnected,
    overall: pgPool !== null && initializationError === null,
    fallback: initializationError !== null,
  };
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Close all database connections
 */
async function close() {
  try {
    if (pgPool) {
      await pgPool.end();
      logger.info('✓ PostgreSQL pool closed');
    }

    if (mongoClient) {
      await mongoClient.close();
      mongoConnected = false;
      logger.info('✓ MongoDB connection closed');
    }

    if (redisClient) {
      await redisClient.quit();
      redisConnected = false;
      logger.info('✓ Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
}

// ============================================================================
// AUTO-INITIALIZATION (if not in test mode)
// ============================================================================

if (process.env.NODE_ENV !== 'test') {
  initialize().catch(error => {
    logger.warn('Database initialization deferred to fallback mode:', error.message);
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  initialize,
  getPostgreSQL,
  getMongoDB,
  getMongoDatabase,
  getRedis,
  isHealthy,
  close,
  DB_CONFIG,
};
