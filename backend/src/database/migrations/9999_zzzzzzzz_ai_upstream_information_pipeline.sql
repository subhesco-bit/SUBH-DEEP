CREATE TABLE IF NOT EXISTS ai_upstream_sources (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, publisher TEXT NOT NULL, url TEXT NOT NULL,
  license TEXT, refresh_interval_minutes INTEGER NOT NULL DEFAULT 1440,
  status TEXT NOT NULL DEFAULT 'unavailable' CHECK (status IN ('active','unavailable','stale')),
  version INTEGER NOT NULL DEFAULT 1, credentials_required BOOLEAN NOT NULL DEFAULT false,
  last_retrieved_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ai_upstream_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), source_id TEXT NOT NULL REFERENCES ai_upstream_sources(id),
  content_type TEXT NOT NULL, raw_artifact JSONB NOT NULL, artifact_hash TEXT NOT NULL,
  provenance JSONB NOT NULL, retrieved_at TIMESTAMPTZ NOT NULL, status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(source_id, artifact_hash)
);
CREATE TABLE IF NOT EXISTS ai_upstream_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), artifact_id UUID REFERENCES ai_upstream_artifacts(id),
  module_id TEXT NOT NULL, input_version TEXT NOT NULL, facts JSONB NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb, freshness TEXT NOT NULL,
  decision JSONB NOT NULL, review_status TEXT NOT NULL DEFAULT 'pending_human_review',
  reviewed_by UUID, reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_upstream_artifacts_source ON ai_upstream_artifacts(source_id, retrieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_upstream_handoffs_module ON ai_upstream_handoffs(module_id, created_at DESC);
