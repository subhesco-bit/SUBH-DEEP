-- Migration: Create Sector Journey Engine Tables
-- Author: Claude Haiku
-- Date: 2026-09-20

-- Journey Instances table
CREATE TABLE IF NOT EXISTS journey_instances (
  id VARCHAR(100) PRIMARY KEY,
  sector VARCHAR(50) NOT NULL,
  userId VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX idx_journey_instances_sector ON journey_instances(sector);
CREATE INDEX idx_journey_instances_userId ON journey_instances(userId);
CREATE INDEX idx_journey_instances_status ON journey_instances(status);

-- Journey Stage Progress table (audit trail)
CREATE TABLE IF NOT EXISTS journey_stage_progress (
  id SERIAL PRIMARY KEY,
  journeyId VARCHAR(100) NOT NULL,
  stage VARCHAR(100) NOT NULL,
  activities JSONB,
  completedActivities JSONB,
  enteredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exitedAt TIMESTAMP,
  FOREIGN KEY (journeyId) REFERENCES journey_instances(id)
);

CREATE INDEX idx_journey_stage_journey ON journey_stage_progress(journeyId);

-- Journey KPI tracking table
CREATE TABLE IF NOT EXISTS journey_kpis (
  id SERIAL PRIMARY KEY,
  journeyId VARCHAR(100) NOT NULL,
  kpiName VARCHAR(100) NOT NULL,
  value NUMERIC,
  trackedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (journeyId) REFERENCES journey_instances(id)
);

CREATE INDEX idx_journey_kpis_journeyId ON journey_kpis(journeyId);
CREATE INDEX idx_journey_kpis_kpiName ON journey_kpis(kpiName);
