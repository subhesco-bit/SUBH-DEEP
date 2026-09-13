-- Migration: Create transactions table
-- Description: Transaction Processing
-- Created: $(date)

BEGIN;

-- Create main table
CREATE TABLE IF NOT EXISTS transactions (
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
  CONSTRAINT transactions_user_fk FOREIGN KEY (user_id)
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
-- transactions: winner is 048_offline_payment_tables.sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS data JSONB;

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
-- transactions: winner is 048_offline_payment_tables.sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON transactions(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON transactions(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON transactions(created_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_updated_at
  ON transactions(updated_at) WHERE deleted_at IS NULL;

-- Index for JSONB data searches
CREATE INDEX IF NOT EXISTS idx_transactions_data_gin
  ON transactions USING gin(data) WHERE deleted_at IS NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_transactions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_timestamp_trigger
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_timestamp();

COMMIT;