-- Phase 3: Bulk Order Management Schema
CREATE TABLE IF NOT EXISTS bulk_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID,
  quantity INT,
  total_amount DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bulk_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_order_id INTEGER NOT NULL REFERENCES bulk_orders(id),
  vendor_id UUID,
  quoted_price DECIMAL(10,2),
  created_at TIMESTAMP
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
-- bulk_orders: winner is 009_marketplace_enhancements.sql
ALTER TABLE bulk_orders ADD COLUMN IF NOT EXISTS buyer_id UUID;

CREATE INDEX IF NOT EXISTS idx_bulk_quotations_order ON bulk_quotations(bulk_order_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bulk_orders'
      AND column_name = 'buyer_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_bulk_orders_buyer ON bulk_orders(buyer_id);
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bulk_orders'
      AND column_name = 'user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_bulk_orders_user ON bulk_orders(user_id);
  END IF;
END $$;
