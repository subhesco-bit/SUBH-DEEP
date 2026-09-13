-- Create AI Predictions Table
CREATE TABLE IF NOT EXISTS ai_predictions (
  id SERIAL PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  model_type VARCHAR(100) NOT NULL,
  prediction JSONB,
  confidence DECIMAL(3,2) DEFAULT 0.85,
  outcome JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
-- ai_predictions: winner is 000_base_schema.sql
ALTER TABLE ai_predictions ADD COLUMN IF NOT EXISTS farm_id UUID;

CREATE INDEX IF NOT EXISTS idx_ai_predictions_model_type ON ai_predictions(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_farm_id ON ai_predictions(farm_id);
