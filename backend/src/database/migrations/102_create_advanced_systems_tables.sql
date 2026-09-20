-- Migration: Create Advanced Systems Tables (Stages 3-6)
-- Author: Claude Haiku
-- Date: 2026-09-20

-- AI Models Registry
CREATE TABLE IF NOT EXISTS ai_models (
  id VARCHAR(100) PRIMARY KEY,
  modelName VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_models_status ON ai_models(status);

-- AI Agents Registry
CREATE TABLE IF NOT EXISTS ai_agents (
  id VARCHAR(100) PRIMARY KEY,
  agentName VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Decisions Log
CREATE TABLE IF NOT EXISTS ai_decisions (
  id SERIAL PRIMARY KEY,
  component VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  confidence INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_decisions_component ON ai_decisions(component);
CREATE INDEX idx_ai_decisions_timestamp ON ai_decisions(timestamp);

-- AI Feedback
CREATE TABLE IF NOT EXISTS ai_feedback (
  id SERIAL PRIMARY KEY,
  enhancementId VARCHAR(100),
  feedback JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_feedback_enhancementId ON ai_feedback(enhancementId);

-- Digital Twin Instances
CREATE TABLE IF NOT EXISTS digital_twins (
  id VARCHAR(100) PRIMARY KEY,
  twinType VARCHAR(50) NOT NULL,
  entityId VARCHAR(100),
  data JSONB NOT NULL,
  scenarios JSONB,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_digital_twins_type ON digital_twins(twinType);
CREATE INDEX idx_digital_twins_entityId ON digital_twins(entityId);

-- Autonomous Operations Log
CREATE TABLE IF NOT EXISTS autonomous_operations (
  id VARCHAR(100) PRIMARY KEY,
  operationType VARCHAR(100) NOT NULL,
  decision JSONB NOT NULL,
  savings NUMERIC,
  status VARCHAR(50) DEFAULT 'COMPLETED',
  executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_autonomous_operations_type ON autonomous_operations(operationType);
CREATE INDEX idx_autonomous_operations_status ON autonomous_operations(status);

-- Evidence Passports
CREATE TABLE IF NOT EXISTS evidence_passports (
  id VARCHAR(100) PRIMARY KEY,
  decisionId VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  verifiable BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_passports_decisionId ON evidence_passports(decisionId);

-- Regions for National Capability Map
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity NUMERIC,
  demand NUMERIC,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cross-System Events
CREATE TABLE IF NOT EXISTS cross_system_events (
  id VARCHAR(100) PRIMARY KEY,
  eventType VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  triggered JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cross_system_events_type ON cross_system_events(eventType);
CREATE INDEX idx_cross_system_events_timestamp ON cross_system_events(timestamp);
