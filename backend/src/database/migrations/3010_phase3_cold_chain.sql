-- Phase 3: Cold Chain Monitoring Schema
CREATE TABLE IF NOT EXISTS temperature_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cold_storage_unit_id UUID,
  temperature DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS temperature_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cold_storage_unit_id UUID,
  alert_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'temperature_readings'
      AND column_name = 'cold_storage_unit_id'
  ) THEN
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
-- temperature_readings: winner is 034_logistics_enhancement_schema.sql
ALTER TABLE temperature_readings ADD COLUMN IF NOT EXISTS cold_storage_unit_id UUID;
-- temperature_alerts: winner is 034_logistics_enhancement_schema.sql
ALTER TABLE temperature_alerts ADD COLUMN IF NOT EXISTS cold_storage_unit_id UUID;

    CREATE INDEX IF NOT EXISTS idx_temp_readings_unit ON temperature_readings(cold_storage_unit_id);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'temperature_alerts'
      AND column_name = 'cold_storage_unit_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_temp_alerts_unit ON temperature_alerts(cold_storage_unit_id);
  END IF;
END $$;
