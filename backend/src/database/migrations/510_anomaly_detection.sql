-- Migration: Create anomaly_detection table
-- Description: Anomaly Detection
-- Created: $(date)

BEGIN;

-- Create main table
CREATE TABLE IF NOT EXISTS anomaly_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Data storage (flexible for different module needs)
  data JSONB DEFAULT '{}' NOT NULL,

  -- Standard fields
  status VARCHAR(50) DEFAULT 'active' NOT NULL
    CHECK (status IN ('active', 'inactive', 'completed', 'pending', 'archived')),

  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,

  -- Constraints
  CONSTRAINT anomaly_detection_user_fk FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for common queries
-- 2026-09-12 collision repair (batch): the CREATE INDEX statements below
-- name columns that do not exist on the table that actually gets created.
-- Each of these tables is declared by more than one migration, and
-- PostgreSQL's CREATE TABLE IF NOT EXISTS silently skips every declaration
-- after the first — so the later, wider definition never took effect and
-- the index that assumed it would fail with "column does not exist",
-- aborting the whole migration run.
--
-- Additive and idempotent: restores exactly the columns the indexes below
-- require, typed from the losing definition that declared them. No-ops on
-- a database where the wider definition already won.
-- anomaly_detection: winner is 039_predictive_analytics_schema.sql
ALTER TABLE anomaly_detection ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE anomaly_detection ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE anomaly_detection ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE anomaly_detection ADD COLUMN IF NOT EXISTS data JSONB;

-- 2026-09-12 collision repair (batch): the CREATE INDEX statements below
-- name columns that do not exist on the table that actually gets created.
-- Each of these tables is declared by more than one migration, and
-- PostgreSQL's CREATE TABLE IF NOT EXISTS silently skips every declaration
-- after the first — so the later, wider definition never took effect and
-- the index that assumed it would fail with "column does not exist",
-- aborting the whole migration run.
--
-- Additive and idempotent: restores exactly the columns the indexes below
-- require, typed from the losing definition that declared them. No-ops on
-- a database where the wider definition already won.
-- anomaly_detection: winner is 039_predictive_analytics_schema.sql
ALTER TABLE anomaly_detection ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_anomaly_detection_user_id
  ON anomaly_detection(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_anomaly_detection_status
  ON anomaly_detection(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_anomaly_detection_created_at
  ON anomaly_detection(created_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_anomaly_detection_updated_at
  ON anomaly_detection(updated_at) WHERE deleted_at IS NULL;

-- Index for JSONB data searches
CREATE INDEX IF NOT EXISTS idx_anomaly_detection_data_gin
  ON anomaly_detection USING gin(data) WHERE deleted_at IS NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_anomaly_detection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER anomaly_detection_timestamp_trigger
BEFORE UPDATE ON anomaly_detection
FOR EACH ROW
EXECUTE FUNCTION update_anomaly_detection_timestamp();

COMMIT;