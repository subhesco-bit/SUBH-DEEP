-- Migration: Create Unified Authentication Tables
-- Author: Claude Haiku
-- Date: 2026-09-20

-- Users table (replaces fragmented user tables)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  hashedPassword VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'farmer',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  identityLevel INTEGER DEFAULT 0,
  mfaEnabled BOOLEAN DEFAULT false,
  mfaSecret VARCHAR(255),
  data JSONB,
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_identityLevel ON users(identityLevel);

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(100) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_userId ON refresh_tokens(userId);
CREATE INDEX idx_refresh_tokens_expiresAt ON refresh_tokens(expiresAt);

-- Blacklisted Tokens table
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  userId VARCHAR(100),
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blacklisted_tokens_expiresAt ON blacklisted_tokens(expiresAt);

-- Password Resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_expiresAt ON password_resets(expiresAt);

-- Identity Records table
CREATE TABLE IF NOT EXISTS identities (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(100) NOT NULL UNIQUE,
  data JSONB NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Authentication Logs table
CREATE TABLE IF NOT EXISTS auth_logs (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(100),
  eventType VARCHAR(100) NOT NULL,
  details JSONB,
  ipAddress VARCHAR(50),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_logs_userId ON auth_logs(userId);
CREATE INDEX idx_auth_logs_eventType ON auth_logs(eventType);
CREATE INDEX idx_auth_logs_createdAt ON auth_logs(createdAt);

-- Sessions table (for device/session tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(100) NOT NULL,
  deviceId VARCHAR(255),
  deviceName VARCHAR(255),
  ipAddress VARCHAR(50),
  userAgent TEXT,
  lastActivity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_userId ON sessions(userId);
CREATE INDEX idx_sessions_expiresAt ON sessions(expiresAt);
