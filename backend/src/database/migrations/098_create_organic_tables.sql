-- Migration: Create Organic Tracking tables
-- Author: Claude Haiku
-- Date: 2026-09-20

-- Organic Transitions table
CREATE TABLE IF NOT EXISTS organic_transitions (
  id VARCHAR(100) PRIMARY KEY,
  farmerId VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'PRE_ORGANIC',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmerId) REFERENCES users(id)
);

CREATE INDEX idx_organic_transitions_farmerId ON organic_transitions(farmerId);
CREATE INDEX idx_organic_transitions_status ON organic_transitions(status);

-- Organic Compliance Checks table
CREATE TABLE IF NOT EXISTS organic_compliance (
  id VARCHAR(100) PRIMARY KEY,
  transitionId VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  compliant BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transitionId) REFERENCES organic_transitions(id)
);

CREATE INDEX idx_organic_compliance_transitionId ON organic_compliance(transitionId);
CREATE INDEX idx_organic_compliance_compliant ON organic_compliance(compliant);

-- Organic Certificates table
CREATE TABLE IF NOT EXISTS organic_certificates (
  id VARCHAR(100) PRIMARY KEY,
  transitionId VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  expiryDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transitionId) REFERENCES organic_transitions(id)
);

CREATE INDEX idx_organic_certificates_transitionId ON organic_certificates(transitionId);
CREATE INDEX idx_organic_certificates_status ON organic_certificates(status);
CREATE INDEX idx_organic_certificates_expiry ON organic_certificates(expiryDate);
