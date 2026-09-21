-- Canonical GST applicability controls: profiles, human-confirmed
-- classification, document lifecycle, reconciliation, idempotency and audit.
CREATE TABLE IF NOT EXISTS gst_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  gstin VARCHAR(15) NOT NULL,
  legal_name VARCHAR(255) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  registration_type VARCHAR(20) NOT NULL DEFAULT 'regular',
  validation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  validated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (owner_id, gstin)
);

CREATE TABLE IF NOT EXISTS gst_classification_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL,
  code VARCHAR(10) NOT NULL,
  kind VARCHAR(3) NOT NULL,
  confidence DECIMAL(4,3),
  confirmed_by UUID NOT NULL,
  confirmed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (suggestion_id)
);

CREATE TABLE IF NOT EXISTS gst_classification_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  candidates JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gst_credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  calculation JSONB NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Canonical UUID documents are kept separate from the historical serial-key
-- gst_invoices/gst_returns tables so old integrations remain readable while
-- the new idempotent flow has one stable identifier across services.
CREATE TABLE IF NOT EXISTS gst_canonical_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  seller_profile_id UUID NOT NULL REFERENCES gst_profiles(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  calculation JSONB NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gst_canonical_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period VARCHAR(20) NOT NULL,
  return_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gst_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  result JSONB NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gst_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation VARCHAR(50) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (operation, idempotency_key)
);

CREATE TABLE IF NOT EXISTS gst_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(80) NOT NULL,
  actor_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gst_audit_events_entity ON gst_audit_events(entity_type, entity_id);
