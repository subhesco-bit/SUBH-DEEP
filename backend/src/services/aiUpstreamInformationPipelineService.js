'use strict';

const crypto = require('node:crypto');
const { createDecision, approveDecision, rejectDecision } = require('../core/ai/decisionContract');
const { ADAPTERS } = require('./aiDomainAdapterService');
const eventBus = require('../platform/events/eventBus');

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).sort().join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function hash(value) {
  return crypto.createHash('sha256').update(canonical(value)).digest('hex');
}

class AIUpstreamInformationPipelineService {
  constructor({ eventBus: bus = eventBus } = {}) {
    this.eventBus = bus;
    this.sources = new Map();
    this.artifacts = new Map();
    this.facts = new Map();
    this.handoffs = new Map();
    this.reviews = new Map();
  }

  registerSource(input = {}) {
    if (!input.id || !input.name || !input.publisher || !input.url) {
      throw Object.assign(new Error('id, name, publisher, and url are required'), { code: 'UPSTREAM_SOURCE_INVALID' });
    }
    const source = {
      id: input.id,
      name: input.name,
      publisher: input.publisher,
      url: input.url,
      license: input.license || null,
      refreshIntervalMinutes: Number(input.refreshIntervalMinutes || 1440),
      status: input.status || 'unavailable',
      lastRetrievedAt: null,
      version: 1,
      credentialsRequired: Boolean(input.credentialsRequired),
      liveAccess: false,
      createdAt: new Date().toISOString(),
    };
    this.sources.set(source.id, source);
    return { ...source };
  }

  getSource(id) {
    return this.sources.get(id) || null;
  }

  sourceState(id, now = Date.now()) {
    const source = this.getSource(id);
    if (!source) throw Object.assign(new Error('Upstream source not found'), { code: 'UPSTREAM_SOURCE_NOT_FOUND' });
    if (!source.lastRetrievedAt || source.status === 'unavailable') return { status: 'unavailable', source };
    const age = (now - new Date(source.lastRetrievedAt).getTime()) / 60000;
    return { status: age > source.refreshIntervalMinutes ? 'stale' : 'fresh', source, ageMinutes: age };
  }

  ingestArtifact({ sourceId, raw, retrievedAt = new Date().toISOString(), contentType = 'application/json', fixture = false } = {}) {
    const source = this.getSource(sourceId);
    if (!source) throw Object.assign(new Error('Upstream source not found'), { code: 'UPSTREAM_SOURCE_NOT_FOUND' });
    if (raw === undefined) throw Object.assign(new Error('raw artifact is required'), { code: 'UPSTREAM_ARTIFACT_INVALID' });
    const artifact = {
      id: `artifact_${crypto.randomUUID()}`,
      sourceId,
      raw,
      contentType,
      retrievedAt,
      hash: hash(raw),
      provenance: { url: source.url, publisher: source.publisher, license: source.license, fixture },
      status: 'captured',
      createdAt: new Date().toISOString(),
    };
    this.artifacts.set(artifact.id, artifact);
    source.lastRetrievedAt = retrievedAt;
    source.status = 'active';
    source.version += 1;
    this.eventBus.publishEvent('ai.upstream.artifact.captured', artifact, {
      idempotencyKey: `artifact:${sourceId}:${artifact.hash}`,
    });
    return { ...artifact };
  }

  normalizeArtifact(artifactId) {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) throw Object.assign(new Error('Artifact not found'), { code: 'UPSTREAM_ARTIFACT_NOT_FOUND' });
    const raw = typeof artifact.raw === 'string' ? JSON.parse(artifact.raw) : artifact.raw;
    const records = Array.isArray(raw) ? raw : (Array.isArray(raw.records) ? raw.records : [raw]);
    const normalized = records.map((record) => ({
      schemeId: String(record.schemeId || record.id || '').trim(),
      name: String(record.name || record.title || '').trim(),
      jurisdiction: String(record.jurisdiction || record.state || 'India').trim(),
      eligibility: record.eligibility || {},
      benefit: record.benefit || null,
      applicationUrl: record.applicationUrl || record.apply_url || null,
      citation: { ...artifact.provenance, artifactId: artifact.id, artifactHash: artifact.hash },
    })).filter((record) => record.schemeId && record.name);
    const byScheme = new Map();
    normalized.forEach((record) => {
      const previous = byScheme.get(record.schemeId);
      if (previous && canonical(previous.eligibility) !== canonical(record.eligibility)) {
        record.conflict = { with: previous.schemeId, reason: 'conflicting eligibility facts in one artifact' };
      } else {
        byScheme.set(record.schemeId, record);
      }
    });
    const conflicts = normalized.filter((record) => record.conflict);
    const result = {
      artifactId,
      version: hash(normalized),
      records: normalized,
      conflicts,
      normalizedAt: new Date().toISOString(),
    };
    artifact.status = conflicts.length ? 'conflict' : 'normalized';
    artifact.normalized = result;
    return result;
  }

  extractEligibilityFacts(artifactId) {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact?.normalized) this.normalizeArtifact(artifactId);
    const facts = artifact.normalized.records.map((record) => ({
      schemeId: record.schemeId,
      facts: { ...record.eligibility },
      citations: [record.citation],
      sourceVersion: artifact.normalized.version,
      extractedAt: new Date().toISOString(),
    }));
    this.facts.set(artifactId, facts);
    if (artifact.status !== 'conflict') artifact.status = 'extracted';
    return facts;
  }

  filterForModule(artifactId, { moduleId = 'subsidy', profile = {} } = {}) {
    const source = this.artifacts.get(artifactId);
    const facts = this.facts.get(artifactId) || this.extractEligibilityFacts(artifactId);
    const matches = facts.filter(({ facts: eligibility }) => Object.entries(eligibility).every(([key, value]) => {
      if (profile[key] === undefined) return true;
      return Array.isArray(value) ? value.includes(profile[key]) : value === profile[key];
    }));
    return {
      moduleId,
      inputVersion: hash({ artifactId, moduleId, profile, matches }),
      facts: matches,
      citations: matches.flatMap((item) => item.citations),
      freshness: this.sourceState(source.sourceId).status,
      filteredAt: new Date().toISOString(),
    };
  }

  buildHandoff(input) {
    const adapter = ADAPTERS[input.moduleId];
    if (!adapter) throw Object.assign(new Error('Unsupported module handoff'), { code: 'UPSTREAM_MODULE_UNSUPPORTED' });
    const filtered = input.filteredInput || this.filterForModule(input.artifactId, input);
    const stale = filtered.freshness !== 'fresh';
    const conflicts = (this.artifacts.get(input.artifactId)?.normalized?.conflicts || []);
    const decision = createDecision({
      engineId: 'ai-upstream-information-pipeline',
      action: 'review-upstream-module-input',
      recommendation: {
        moduleId: adapter.moduleId,
        capability: adapter.capability,
        input: filtered,
        blocked: stale || conflicts.length > 0,
        conflicts,
      },
      inputs: [{ name: 'upstreamInput', value: filtered }],
      source: filtered.citations.map((citation) => citation.url || citation.artifactId),
      rationale: [
        stale ? 'Source is unavailable or stale; module input is advisory only.' : 'Input is filtered from a versioned upstream artifact.',
        ...(conflicts.length ? ['Conflicting upstream facts require human reconciliation.'] : []),
      ],
      explanation: 'No module-specific eligibility logic is executed in the upstream pipeline.',
      dataQuality: { score: stale || conflicts.length ? 0 : 1, freshness: filtered.freshness, conflicts: conflicts.length },
      sideEffects: ['module-consumption'],
      audit: { adapter: adapter.moduleId, sourceVersion: filtered.inputVersion },
    });
    const handoff = { id: `handoff_${crypto.randomUUID()}`, decision, status: 'pending_human_review', createdAt: new Date().toISOString() };
    this.handoffs.set(handoff.id, handoff);
    this.eventBus.publishEvent('ai.upstream.handoff.created', handoff, { idempotencyKey: handoff.id });
    return handoff;
  }

  reviewHandoff(id, { approvedBy, approved, reason } = {}) {
    const handoff = this.handoffs.get(id);
    if (!handoff) throw Object.assign(new Error('Handoff not found'), { code: 'UPSTREAM_HANDOFF_NOT_FOUND' });
    handoff.decision = approved
      ? approveDecision(handoff.decision, approvedBy, reason)
      : rejectDecision(handoff.decision, approvedBy, reason || 'Human reviewer rejected upstream input');
    handoff.status = handoff.decision.status;
    this.reviews.set(id, { reviewedBy: approvedBy, reviewedAt: new Date().toISOString(), approved });
    return handoff;
  }

  deterministicSubsidyFixture() {
    const sourceId = 'fixture-myscheme-public-platform';
    if (!this.sources.has(sourceId)) this.registerSource({
      id: sourceId, name: 'MyScheme public platform fixture', publisher: 'Government of India',
      url: 'https://myscheme.gov.in/schemes/fixture', license: 'public-domain', status: 'unavailable',
    });
    const artifact = this.ingestArtifact({
      sourceId,
      fixture: true,
      raw: { records: [{
        schemeId: 'PM-KISAN-FIXTURE', name: 'PM-KISAN (deterministic fixture)', jurisdiction: 'India',
        eligibility: { state: 'Assam', farmer: true }, benefit: { amount: 6000, currency: 'INR' },
        applicationUrl: 'https://myscheme.gov.in/schemes/fixture',
      }] },
      retrievedAt: '2026-09-10T00:00:00.000Z',
    });
    this.normalizeArtifact(artifact.id);
    this.extractEligibilityFacts(artifact.id);
    const filteredInput = this.filterForModule(artifact.id, { moduleId: 'subsidy', profile: { state: 'Assam', farmer: true } });
    return { source: this.getSource(sourceId), artifact, eligibilityFacts: this.facts.get(artifact.id), filteredInput, handoff: this.buildHandoff({ moduleId: 'subsidy', artifactId: artifact.id, filteredInput }) };
  }
}

module.exports = new AIUpstreamInformationPipelineService();
module.exports.AIUpstreamInformationPipelineService = AIUpstreamInformationPipelineService;
module.exports.hash = hash;
