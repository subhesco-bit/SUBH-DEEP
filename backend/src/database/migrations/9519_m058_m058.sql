-- Folded from backend/src/modules/M058/model.sql (AUDIT_DB.md Finding 11/13 remediation)
-- Returns Management Schema (M058)
-- Generated 2026-08-30 — DB linkage fix, see .ai/tasks/ACTIVE.md

CREATE TABLE IF NOT EXISTS returns (
    return_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    refund_amount DECIMAL(15,2),
    notes TEXT,
    ai_recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
-- returns: winner is 339_returns.sql
ALTER TABLE returns ADD COLUMN IF NOT EXISTS order_id VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_returns_order ON returns(order_id);

CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
