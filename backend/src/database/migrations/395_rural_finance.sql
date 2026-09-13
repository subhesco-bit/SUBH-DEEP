-- Migration: Create rural_finance table
-- Description: Rural Finance
-- Created: $(date)

BEGIN;

-- Create main table
CREATE TABLE IF NOT EXISTS rural_finance (
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
  CONSTRAINT rural_finance_user_fk FOREIGN KEY (user_id)
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
-- rural_finance: winner is 041_rural_life_os_schema.sql
ALTER TABLE rural_finance ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE rural_finance ADD COLUMN IF NOT EXISTS data JSONB;

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
-- rural_finance: winner is 041_rural_life_os_schema.sql
ALTER TABLE rural_finance ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_rural_finance_user_id
  ON rural_finance(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rural_finance_status
  ON rural_finance(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rural_finance_created_at
  ON rural_finance(created_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rural_finance_updated_at
  ON rural_finance(updated_at) WHERE deleted_at IS NULL;

-- Index for JSONB data searches
CREATE INDEX IF NOT EXISTS idx_rural_finance_data_gin
  ON rural_finance USING gin(data) WHERE deleted_at IS NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_rural_finance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rural_finance_timestamp_trigger
BEFORE UPDATE ON rural_finance
FOR EACH ROW
EXECUTE FUNCTION update_rural_finance_timestamp();

COMMIT;