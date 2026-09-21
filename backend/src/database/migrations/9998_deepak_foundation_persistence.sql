-- Deepak concept foundation persistence:
-- canonical master-data versions, correlated events, and workflow history.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS mdm_records (
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    source VARCHAR(128) NOT NULL DEFAULT 'application',
    record JSONB NOT NULL,
    updated_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS mdm_record_versions (
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL,
    record JSONB NOT NULL,
    changed_by VARCHAR(255),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (entity_type, entity_id, version)
);

CREATE TABLE IF NOT EXISTS platform_event_outbox (
    event_id UUID PRIMARY KEY,
    event_type VARCHAR(128) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    context JSONB NOT NULL DEFAULT '{}',
    correlation_id UUID NOT NULL,
    idempotency_key VARCHAR(255),
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (idempotency_key)
);

CREATE TABLE IF NOT EXISTS workflow_instance_history (
    id BIGSERIAL PRIMARY KEY,
    workflow_instance_id VARCHAR(255) NOT NULL,
    workflow_code VARCHAR(128) NOT NULL,
    entity_type VARCHAR(128) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    from_state VARCHAR(128),
    to_state VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    actor_id VARCHAR(255),
    payload JSONB NOT NULL DEFAULT '{}',
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rural_unit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_type VARCHAR(64) NOT NULL,
    unit_id VARCHAR(255) NOT NULL,
    direction VARCHAR(16) NOT NULL CHECK (direction IN ('credit', 'debit')),
    amount NUMERIC(20, 4) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    category VARCHAR(64) NOT NULL,
    reference VARCHAR(255) NOT NULL,
    actor_id VARCHAR(255),
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmer_product_lifecycle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    marketplace_product_id UUID,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'nutrition_pending', 'dietitian_review', 'approved', 'rejected')),
    product_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    nutrition_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    nutrition_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
    dietitian_review JSONB,
    health_plan_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    canonical_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    batch_id VARCHAR(128),
    laboratory_verification JSONB NOT NULL DEFAULT '{}'::jsonb,
    allergen_conflicts JSONB NOT NULL DEFAULT '[]'::jsonb,
    recall_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    fefo_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    health_plan_invalidated_at TIMESTAMPTZ,
    health_plan_invalidation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farmer_product_lifecycle_canonical_product
    ON farmer_product_lifecycle (canonical_product_id);
CREATE INDEX IF NOT EXISTS idx_farmer_product_lifecycle_batch
    ON farmer_product_lifecycle (batch_id);
CREATE INDEX IF NOT EXISTS idx_farmer_product_lifecycle_fefo
    ON farmer_product_lifecycle (fefo_eligible, recall_blocked);

CREATE TABLE IF NOT EXISTS audit_chain_events (
    sequence BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    actor_id UUID,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(128) NOT NULL,
    entity_id VARCHAR(255),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    correlation_id VARCHAR(255),
    previous_hash CHAR(64),
    event_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mdm_versions_entity
    ON mdm_record_versions (entity_type, entity_id, version);
CREATE INDEX IF NOT EXISTS idx_event_outbox_type_time
    ON platform_event_outbox (event_type, published_at);
CREATE INDEX IF NOT EXISTS idx_workflow_history_instance
    ON workflow_instance_history (workflow_instance_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_rural_unit_ledger_unit
    ON rural_unit_ledger (unit_type, unit_id, currency, created_at);
CREATE INDEX IF NOT EXISTS idx_farmer_product_lifecycle_farmer
    ON farmer_product_lifecycle (farmer_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_chain_events_entity
    ON audit_chain_events (entity_type, entity_id, created_at);
