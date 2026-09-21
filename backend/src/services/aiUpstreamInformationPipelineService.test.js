'use strict';

const { AIUpstreamInformationPipelineService, hash } = require('./aiUpstreamInformationPipelineService');

test('runs deterministic subsidy source to filtered governed handoff with citations', () => {
  const service = new AIUpstreamInformationPipelineService({ eventBus: { publishEvent: jest.fn() } });
  const result = service.deterministicSubsidyFixture();
  expect(result.source.liveAccess).toBe(false);
  expect(result.artifact.hash).toBe(hash(result.artifact.raw));
  expect(result.eligibilityFacts[0].citations[0]).toMatchObject({ publisher: 'Government of India' });
  expect(result.filteredInput.facts).toHaveLength(1);
  expect(result.handoff.decision.status).toBe('pending_human_review');
  expect(result.handoff.decision.blockedSideEffects.blocked).toBe(true);
});

test('reports unavailable and stale sources without pretending to scrape', () => {
  const service = new AIUpstreamInformationPipelineService({ eventBus: { publishEvent: jest.fn() } });
  service.registerSource({ id: 'no-credential', name: 'Provider', publisher: 'Provider', url: 'https://example.invalid', refreshIntervalMinutes: 1 });
  expect(service.sourceState('no-credential').status).toBe('unavailable');
  service.ingestArtifact({ sourceId: 'no-credential', raw: { records: [{ id: 'x', name: 'X', eligibility: {} }] }, retrievedAt: '2020-01-01T00:00:00.000Z' });
  expect(service.sourceState('no-credential', Date.parse('2020-01-01T02:00:00.000Z')).status).toBe('stale');
});
