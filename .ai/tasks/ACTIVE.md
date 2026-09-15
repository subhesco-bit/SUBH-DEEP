# 📋 ACTIVE TASKS — REAL-TIME TRACKING

**15 September Claude Code work handoff:** see `.ai/handoffs/CLAUDE_WORK_HANDOFF_2026-09-15.md` for the current all-India integrated commerce baseline, concrete work packages, tests, blockers and 19 September return target. The older Northeast-only project summaries are superseded by the user's national sell-and-buy mandate.

**Last Updated:** 2026-09-12
**Active Roster:** Claude Code, ChatGPT, GitHub (Copilot default). Devin: historical source only, not active roster — see `.ai/AGENT_PROTOCOL.md`.

---

## PROGRAM: Single Project → Hardening → Testing → Enhancement → Launch

Five phases, in order. Do not start a phase before the previous one's exit criteria are met
for the track/area in question — a feature that isn't consolidated yet can't be meaningfully
hardened or tested.

### Phase 1 — Consolidation (single project, not parallel copies) — **IN PROGRESS**

**Canonical target confirmed:** root `backend/` + `frontend/` (git-tracked, 5,164+ backend files,
matches CLAUDE.md). `_ACTIVE_PROJECT/current` is untracked by git and is treated as just another
historical source to fold in, not a second live target.

Exit criteria per feature track:
1. Every same-name/different-content file disambiguated (done for all 9,496 tracks — see
   `_MERGE_LAB/features/`)
2. Symbol-diff + wiring-check run (done for all conflict tracks — `_MERGE_LAB/reports/intel-*.json`,
   `intel-summary-all.json`)
3. One production version built per feature (union of unique symbols across sources, conflicts
   resolved explicitly)
4. Verified wired into the live tree (real import/require/route/mount, not just present)

**Done so far:**
- Full file map: 422,873 files (`docs/codex-file-map.csv`), 64,330 real source files after
  excluding dependency_cache/build_output/log_or_report_output
- Feature grouping: 9,496 tracks, 2,702 conflict groups, 46,907 conflicting files all
  disambiguated into `_MERGE_LAB/features/<feature>/<source>__<hash>__<name>` (0 lost, 0 errors)
- Reusable wiring index built (`_MERGE_LAB/reports/wiring-index.json`, 7,236 files scanned)
- Intel run across all conflict tracks: 7,201 stems, **3,742 orphaned** (wired to nothing),
  3,939 with genuine unique-per-source symbols
- **security-auth track resolved:**
  - `passwordUtils.js` — was broken (callers expected bcrypt named exports, file exported a
    class with different methods; login/2FA would throw). Fixed, tested, committed (`13cf6e8a`)
  - `security.js` (backend) — confirmed deliberately unwired by design (documented in-file,
    would conflict with existing helmet/rate-limiter and break CSRF with no express-session).
    No action needed.
  - `security.js` (frontend, `frontend/src/utils/security.js`) — exists, zero importers.
    Flagged as a real gap (XSS/CSRF utilities unused); wiring it in needs a call-site audit,
    not yet done.

**Module-lineage audit (`.ai/decisions/0001`):** 22 module-number collisions found between
plain-numeric (`backend/src/modules/M0xx`) and name-suffixed (`M0xx_NAME`) folders. Root cause in
17 of 22: a real service already exists in `backend/src/services/legacy/`, correctly wired via a
thin delegator in the named module folder, but never mounted to a live Express route — the
"duplicate" was never really duplicate content, just unwired real work sitting next to an
unclaimed generic placeholder. Fixed so far (commits `22262186`, `e4c495a1`):
- `crop-domain` (6 resources), `seed-vault`, `financial-ai`, `livestock` (3 resources),
  `soil` (3 resources) — all mounted at `/api/v1`, paths verified against actual frontend page
  usage (not just `api.js` grep hits — some `api.js` entries are themselves generic unused
  stubs)
- Along the way, found and fixed a second live frontend bug (same class as `passwordUtils.js`):
  `SoilManagementPage.jsx` called API client methods that didn't exist on the exported object
  (`soilHealthAPI.getCards`, `nutrientManagementAPI.getPlans`, etc.) — added them to
  `frontend/src/services/api.js` to match what the page already expects
- `frontend/.env`'s `VITE_API_BASE_URL` looks stale/wrong (wrong port, no path) vs. the designed
  convention (Vite dev proxy on `/api/*` → backend `/api/v1`) — flagged, not yet fixed (separate
  concern from routing)

**22-pair audit: FULLY CLOSED (commits `22262186`, `e4c495a1`, `2cf82fb3`, `d0aa9629`,
`904bfe21`).** Final disposition, every one of the 22 pairs resolved:
- **17 real features wired to live routes this session:** crop-domain (6), seed-vault,
  financial-ai, livestock (3), soil (3), dairy (6 + 4 AI actions), fertilizer, ERP (already had
  its own router), organization (2 new methods added + wired), governance, cost (2 pre-existing
  broken requires fixed), fisheries (9 sub-modules, correct-service-mapping fix) — all
  require-load smoke-tested before mounting, all paths verified against actual frontend page
  usage, not just an `api.js` grep hit
- **7 frontend bugs found+fixed** of the same class as `passwordUtils.js` (pages calling
  API-client methods that don't exist on the exported object): soil, dairy, fertilizer, and 4 of
  the 9 fisheries sub-modules. This is a confirmed repeatable bug class — worth a dedicated
  sweep across the rest of `api.js` at some point, not just the instances found in passing
- **5 already fine, spot-checked and confirmed real** (weather/M105, compliance/M205,
  audit/M206, hr/M306, asset-accounting/M308) — real endpoint counts, no stub pattern, each
  genuinely requires and calls its target service
- **2 pre-existing bugs found and fixed along the way** (not related to module-lineage, found
  while tracing the delegate targets): `costRoutes_merged.js` required a nonexistent path and
  had a second broken/unused import; `governanceModule_merged.js` imported an export
  `rateLimiter.js` doesn't have (`authRateLimit` vs the real `authLimiter`)

**NEW, large initiative found: frontend API-client mismatch sweep.** Systematic scan
(`tools/codex-api-client-mismatch-scan.js`) of all 1,272 frontend page/component files found
**607 instances** of the `passwordUtils.js`-class bug (page calls `xxxAPI.method()`, method
doesn't exist on the exported client) across **113 distinct API clients**. Ran a batch verifier
(`tools/codex-api-mismatch-verify.js`) to see how much of this is safely scriptable: only
**1 of 607** has a safe exact-name auto-fix; the rest need the same manual per-resource,
per-path verification as the module-lineage audit, because most real backend services use the
CRUD-factory shape (`list`/`get`/`create`/`update`/`remove` per resource), not flat method names
matching the page. 90 of the 607 have no plausible backend service at all (likely unbuilt
features, not wiring gaps). Biggest single-page gaps by mismatch count: `comprehensiveERPAPI`
(46 — full GL/journal/trial-balance/balance-sheet accounting UI with a 2-method stub backing it),
`researchAndDevelopmentAPI` (23), `sapModuleArchitectureAPI` (19), `animalHealthAPI` (17),
`completeAIIntegrationAPI`/`completeERPIntegrationAPI` (15 each). Full data:
`_MERGE_LAB/reports/api-mismatch-verified.json`. Prioritized by impact, tackled in batches with
require-load verification after each batch (commits `e9d77697`, `fd12452c`, `eee7adc5`):
- Batch 1: `comprehensiveERPAPI` (46/46) — 12-sub-module SAP-style ERP service wired
- Batch 2: `researchAndDevelopmentAPI` (23/23) — R&D projects/patents/funding/knowledge base wired
- Batch 3: `sapModuleArchitectureAPI` (19/19) — module registry (lifecycle, deps, versioning) wired
- Batches 4-18 (commits `d57abf6b` through `a55cd2d8`): animalHealthAPI, completeAIIntegrationAPI,
  completeERPIntegrationAPI, aiOperationIntelligenceAPI, aiSelfHealingAPI, coldStorageAPI,
  costControlAPI, enterpriseControlAPI, sheepAPI, aiAgentAPI, aiBrainAPI, ecommerceAIAPI,
  agriculturalIntelligenceAPI, ecommerceIntegrationAPI, poultryAPI
- `5ebd151c`: found `backend/src/routes/ORPHANED_SERVICES_MOUNT.js` already mounts 9 services
  with real setupRoutes(app) that were never called; found 16 MORE never-called the same way
  (householdEconomy, renewableEnergy, ruralEnterprise, villageProfile, aiAdvisory,
  aiAgenticCompanion, decisionSupport, buyingClub, machineryAccess, marketAccess,
  marketIntelligence, procurementSubscription, ruralFinance, custodyEvent, mobilityRides,
  analyticsMonitoring) - all verified with setupRoutes(fakeApp) before wiring, mounted directly
  with the real `app` (not a sub-router, which would double-prefix their absolute paths)
- Commits `67573168` through `e2fd1c18`: assetAccountingAPI, decisionSupportAPI (custom routes -
  its own setupRoutes' internal router is itself a stub), ecommerceAPI, ordersAPI (money/order
  handling - authMiddleware required, not optional), weatherAPI, cooperativeShareAPI, walletAPI
  (wallet_id resolved via getBalance(userId), a separate DB id from user_id),
  equipmentExchangeAPI, multilingualAPI, ecommerceBusinessSalesAPI, bulkOrderAPI (userId always
  from server auth, never client-trusted), civilDisruptionAPI, engineeringProjectAPI,
  ecommerceERPAPI, experienceAPI, insuranceAPI
- Skipped (investigated, no real match, not forced): vendorsAPI, machineryAPI (tractor
  CRUD/booking - no backend anywhere), enterpriseAIAPI (credit-scoring signatures don't match),
  auditComplianceAPI (anomaly-detection/log-integrity concepts absent from real service),
  greenhouseAPI (page's own code comment admits the CRUD shape it calls has no backend),
  marketplaceAPI (unused by any page)
- Commits `8cb52b84` through `f2e6e4c3`: authorizationAPI (partial), climateMonitoring cluster
  (drought/flood/disease/climateRisk/agroMeteorology, 1 service backing all 5), community
  management cluster (producerGroup/communityAsset/ruralDevelopment/block/district/state, 1
  service backing all 6), rfqAPI, cropVarietyAPI/cropMonitoringAPI completion (gap from the very
  first batch), farmerHealthRecordsAPI, kycAPI, farmerVerificationAPI, cropRegistrationAPI fix,
  horticultureManagement cluster (8 sub-modules, 1 service - 7 of 8 api.js clients were already
  correct, just needed the backend), landAPI
- Skipped (investigated, no real match): enterpriseAIAPI, machineryAPI (tractor), auditComplianceAPI,
  greenhouseAPI (page's own note admits it), marketplaceAPI, digitalTwinAPI (fragile internal
  state dependency), farmerFamilyAPI/farmerProfileAPI/farmerSkillAPI/userAPI (confirmed stubs or
  no backend at all), cropCalendarAPI, hydroponicsAPI was NOT skipped (real backend found)
- Commits `2a56c9a7`, `08203093`, `35a73388`, `a879c721`: returnLoadBoardAPI,
  realtimeMonitoringAPI, conversationalAIAPI, voiceAIAPI, aiBackboneAPI, companyAPI, financeAPI,
  complianceAPI, defenseFitnessPrepAPI, enterpriseIntegrationAPI, escrowAPI, financialAIAPI
  (partial), systemAdministrationAPI, logisticsAIAPI (partial), blockchainVerificationAPI,
  knowledgeGraphAPI, cropValueResearchAPI, tenantManagementAPI, platformCoreAPI, mfaAPI,
  organicTraceabilityAPI, ecommerceMarketingAPI, sellerRankingAPI (partial — no write/"set rank"
  backend exists), farmerValueAPI (surfaced+mounted a real internal router that existed but was
  never mounted, same pattern as the seed-vault bug), transactionAPI, notificationAPI,
  privacyAPI, pestForecastingAPI, adminAPI, systemAPI, erpAPI (fixed to call the already-real,
  already-mounted `/api/v1/erp/status`)
- **SWEEP COMPLETE: all 607 mismatches across 113 clients triaged.** Final disposition:
  ~515 wired to real backend routes/methods; ~90 confirmed no real backend exists anywhere
  (skipped, not faked — see the "Skipped" notes above and below); a small number are documented
  pre-existing gaps left as-is (`caAPI.getAuditStats` — CADashboardPage.jsx's own comments already
  flag it as illustrative-only) or intentionally unwired for lack of a matching backend action
  (`panchayatAPI` — no panchayat entity in communityManagementService.js, only
  block/district/state/producerGroup/communityAsset/ruralDevelopment; `fpoAPI.getStats` — no
  aggregate stats method on cooperativeShareService.js, only member/distribution operations)

**`ecommerce-marketplace` track: CLOSED (commits `9e63461f`, `80e72492`).** Of the 775
"orphaned" (zero wired references) stems, most were false positives or already resolved:
- 9 "orphaned" SQL migrations were a wiring-check false positive — migrations aren't
  require()'d/imported, they're picked up by the migration runner's directory scan, and all 9
  already exist live in `backend/src/database/migrations/` (verified by exact filename match in
  `docs/codex-file-map.csv`)
- 227 `module.json` hits are manifest data, not code (noise)
- ~700 stems (M0xxPage.jsx/M0xxComponent.jsx scaffolds, and named components like
  `toast.jsx`/`useGeolocation.js`/`QRCodeScanner.jsx`/`FoodSafetyDashboard.jsx`/etc.) were spot-
  checked and confirmed already present live under `frontend/src/` — stale old-new-folder copies
  already superseded, not missing features
- 2 (`productAIRoutes.js`, `orderAIRoutes.js`) are empty "Route operational" scaffolds with zero
  real business logic — correctly left unwired, nothing to preserve
- **12 real, fully-formed route files recovered** from the old-new-folder dump — each verified
  method-by-method against a real, still-live backing service before mounting: apiculture (M028),
  contractFarming, forestry (M026), vermicompost (M030), sericulture (M027), fisheries (M025 —
  confirmed a different service from the already-wired fisheriesManagementService.js, no path
  collision), householdProcurement, moduleRegistry (HTTP shim over `core/moduleRegistry.js`),
  preSeasonPurchase, gdpr (fuller surface than the already-wired privacyDomainRoutes.js — RTBF,
  data export, residency, PIA — mounted at a non-colliding path), governmentSubsidy, mushroom
  (M029). None have a frontend page/API client yet — backend-only recovery of real, previously-
  lost work.
- 2 explicitly skipped: `mfaroutes.js` (broken — `getUserMFASecret` placeholder always returns
  null, verify could never succeed; also collides with the working `mfaDomainRoutes.js`),
  `hrcontroller.js` (fully redundant with the already-mounted `backend/src/routes/hrRoutes.js`)
- ~20 remaining stems are dev/ops tooling scripts (`redis-cache.js`, `database-monitor.js`,
  `backup-manager.js`, `transaction-manager.js`, `advanced-pool.js`, `schema-collisions.js`,
  `database-security.js`, plus meta-tooling like `find-orphan-services.js`/`module-audit.js`/
  `route-audit.js`/`a11y-audit.js`/`link-audit.js` that look like artifacts of a *previous*
  consolidation attempt, not app features) — deferred to Phase 2 Hardening rather than forced
  into Phase 1, since they're infrastructure/tooling, not user-facing features

**`database-model` track: CLOSED (commit `904a30ff`).** Of the 304 orphaned stems, 274 were SQL
migrations - the same directory-scan-vs-require() false positive found in ecommerce-marketplace.
One real find: `databaseManagementRoutes.js` (28 endpoints: database provisioning,
cluster/replication/sharding, backup/restore, query optimization/caching) already existed live
with a real, fully-matching backing service (`services/databaseManagementService.js`, every
method + internal Map property verified) but was never mounted. Added `authMiddleware` +
`adminMiddleware` before mounting - the recovered file had zero auth despite exposing database
provisioning/deletion and backup/restore, a real security gap if shipped as found. Remaining
non-SQL orphans (`redis-cache.js`, `database-monitor.js`, `backup-manager.js`,
`transaction-manager.js`, `advanced-pool.js`, `schema-collisions.js`, `database-security.js`,
`query-optimizer.js`, `seed-economic.js`, `enhanced-migrate.js`) are dev/ops tooling script
duplicates, same disposition as ecommerce-marketplace's tail - deferred to Phase 2 Hardening.

**6 small tracks: CLOSED, no action needed.** `mobile-shell` (39 orphaned) and `desktop-shell` (5
orphaned) are pure Android/Capacitor/Tauri build assets and config (icons, gradle files,
manifests) - static build config, not application code, nothing to wire. `dietitian-nutrition` (9),
`dynamic-pricing` (6), and `voice-farmer` (7) orphans are entirely the SQL-migration false
positive plus `.html` mirror files and test files - no real gaps. `public-price-extraction` (8)
had two real candidates, both investigated and left as-is:
- `publicDomainDataExtractionService.js` (879 lines, `services/platform/`) is an in-memory
  `Map`-based **simulation** (`simulateExtraction`, no real scraping/API calls, no persistence) -
  wiring it in as a "real" feature would present simulated data as genuine, against this
  project's own established discipline. The existing mounted route
  (`routes/platform/publicDomainDataExtractionRoutes.js`) is an honest in-memory CRUD scaffold
  that does NOT call this simulation service - left as-is rather than connecting a fake data
  generator to a live endpoint.
- `backend/src/jobs/loadMandiPrices.js` is a real, well-documented, government-API-backed job
  (pulls live Agmarknet mandi prices via data.gov.in, ingests via
  `services/legacy/marketDataService.js`'s real `ingestMandiPrices`) — genuinely useful but
  designed for cron/CLI invocation, not an Express route. No cron/scheduler infrastructure exists
  anywhere in this codebase yet (`find backend/src -iname "*cron*" -o -iname "*scheduler*"` -
  zero hits), so activating this job is a Phase 2/5 deployment-infrastructure task (add a
  scheduler, register the job), not a Phase 1 wiring bug — flagged for the deploy checklist.

**Next up:**
- `ai-chat-copilot` — 1,761 stems, 845 orphaned (mostly agent-workspace noise per keyword
  classification — needs noise-filtering before trusting the count)

### Phase 2 — Hardening — NOT STARTED

- Security review pass across the consolidated tree (OWASP, secrets, injection) — informed by
  what Phase 1 surfaces (e.g. the passwordUtils-class bug pattern may repeat elsewhere)
- Dependency/CVE audit (`npm audit`) per `.ai/workflows/MERGE_EXECUTION_SCHEDULE.md` Batch 3
- Config/env-var validation, error handling at real boundaries

### Phase 3 — Testing — NOT STARTED

- Real test coverage for merged features (current baseline: framework configured, 0% coverage
  per CLAUDE.md)
- Full backend + frontend suite green
- Golden-path E2E smoke tests

### Phase 4 — Enhancement — NOT STARTED

- Priority-enhancement-track items once their base is consolidated/hardened/tested:
  ai-chat-copilot, ecommerce-marketplace, dietitian-nutrition, dynamic-pricing, farm-costing,
  ai-image-cartoon

### Phase 5 — Launch — NOT STARTED

- Database migrations executed (PostgreSQL currently not running — CLAUDE.md P0 blocker)
- Infra/deployment asset review (`infra_deployment` category, 165 files)
- Launch checklist sign-off

---

**Reports:** `docs/codex-feature-merge-matrix.md`, `docs/codex-duplicate-rename-plan.csv`,
`_MERGE_LAB/reports/intel-summary-all.json`
**Protocol:** `.ai/AGENT_PROTOCOL.md`

---

## 2026-09-12 — Batch bug resolution: migration chain unblocked

Full write-up: `.claude/audits/FIXES_2026-09-12_BATCH.md`.

**Headline:** `npm run migrate` could not run at all. Not "had not been run" — the chain
contained 156 statements PostgreSQL rejects outright, the earliest in `014`, and
`migrate.js` rethrows on the first failure. All 156 are now closed, and
`migration_preflight.js` reports 0 blockers (was 3).

Worked by bug class, each class swept to zero and re-scanned to prove it:

| Class | Before | After |
|---|---|---|
| FK child type ≠ winning parent PK type | 94 | 0 |
| FK → column the winning parent lacks | 2 | 0 |
| `CREATE INDEX` on a column the winning table lacks | 147 | 0 |
| Partial index `WHERE deleted_at IS NULL`, no `deleted_at` | 14 | 0 |
| `migration_preflight.js` blockers | 3 | 0 |

Root cause throughout: ~105 table names are declared by more than one migration and
`CREATE TABLE IF NOT EXISTS` silently skips all but the first, so later migrations index,
reference and type columns against a shape that never got created.

**Four collisions had the wrong winner** — resolved by renaming the squatter after checking
which definition live code actually queries. Recorded in `schema-decisions.json`:
`product_listings` → 097's AI-image copy renamed `ai_image_product_listings` (this alone
closed 14 FK findings); `monitoring_metrics`/`monitoring_alerts` → 9532's M086 copies renamed
`m086_*`; `soil_samples` → 9510's M032 copy renamed `m032_soil_samples`.

**Protected-file exceptions.** 18 column repairs that appeared to need edits inside
`000-071` did not: `000_zz_collision_column_repair.sql` and
`010_zz_collision_column_repair.sql` sort into the gap after each table is created and
before the first index needing it (same approach as the existing `roles` repair). 7 FK type
mismatches in `014`/`041`/`061` genuinely could not be repaired from a later migration —
fixed in place **with explicit user approval**, each annotated with why.

**Also fixed**
- Unary `+`/`-` in the agent calculator (`aiAgentService.js`) — `-5+3`, `(-5+3)`, `2*-3` were
  all rejected. This was the only finding in `.claude/audits/AUDIT_BUGS.md` still live; the
  other three were already fixed and that audit is now stale.
- Migration ordering disagreed with itself across 5 sites. `migrate.js` orders numerically;
  `migration_preflight.js`, `tools/schema-collisions.js`, `tools/gen-reconciliation.js` and
  the two alternate runners used plain `.sort()`, where `"1000_"` precedes `"999_"`. The
  checkers named the wrong winner for 5 tables and the alternate runners would have produced
  a different database than `npm run migrate`. All now import
  `backend/src/database/migrationOrder.js`.
- **Login and registration were broken and leaking credentials.** `authAPI.login`/`register`
  used `api.get('/auth/login', { params })` against a `router.post('/login')` that reads
  `req.body` — `LoginForm.jsx`/`RegisterForm.jsx` could never sign anyone in, and the
  password travelled in the request line into logs, history and `Referer`. Now `api.post`.

**Wiring — quantified, deliberately not auto-fixed.** Resolved the real 5,819-endpoint table
the way `dynamicRouteLoader.js` actually mounts it (auto-mount of everything under
`backend/src/routes` at `/api/v1/<kebab name>`, plus aliases, plus `index.js`). Note for
future passes: reading `index.js` alone is misleading — it makes ~545 route files look
orphaned and suggests `/api/v1/auth` is unmounted, which it is not.
`tools/route-audit.js`'s "545 orphaned" figure has this flaw.

Remaining: 285 call sites invoke an API-client method that does not exist (each a render-time
`TypeError`), and 2,823 endpoint literals have no backend route. A fuzzy matcher for these was
built and **discarded** — it paired `consumerHealthAPI.getHealthMetrics()` with
`/api/v1/ai-self-healing/health-metrics`, i.e. a different subsystem. Under a strict rule only
1 of 285 was justifiable. This is the surface `FIXES.md` already defers as **F6**: a bounded
backend build-out per resource family, not a wiring fix.

**Not verified against a live database** — PostgreSQL is not up here. Everything is checked
structurally and against the resolved schema model. Run `npm run migrate` in CI/staging before
trusting it.

## ASTRA reconstruction continuation — 12 September 2026

Bounded batches implemented: authentication/password verification and test-runner integrity;
canonical M041 village search → frontend dashboard wiring and validation; streaming authority
reconciliation tooling. Existing user changes preserved. See `docs/reconstruction-20260912.md`
for source preservation, verification commands, limits and remaining work. Full project
reconstruction is still IN PROGRESS; the full backend run recorded 359 failing suites before
being stopped and is not a passing gate. No completion certificate, deployment or merge.

---

## 2026-09-13 — Duplicate retirement under ADR 0001

Full record: `.claude/audits/RETIREMENT_2026-09-13.md`.

Applied the retirement gate in `.ai/decisions/0001-module-lineage-consolidation.md` §6 and
`CONSOLIDATION_PLAN.md` Phase 3.1 to the `*_merged.js` route duplicates.

**Direction corrected first.** The previous pass had each canonical `xRoutes.js` delegate to
its `xRoutes_merged.js` sibling — reachable, but with the duplicate holding the
implementation. Phase 3.1 step 4 puts the consolidated code in the canonical file and leaves
the wrapper on the duplicate. 42 files inverted; endpoint sets byte-identical.

**Running the gate before retiring paid for itself:**
- 6 route families did not load at all. `enterpriseRouteSupport.js`,
  `livestockRouteSupport.js`, `climateRouteSupport.js` hold shared request-hardening helpers;
  `2e3420a1` corrupted them and `441c87e4` replaced them with router stubs instead of
  repairing. Recovered from git; every consumer was throwing `... is not a function`.
- A corruption class that passes every syntax gate: a **bare `\r`** where a newline belonged.
  JS treats `\r` as a line terminator, so the file parses — but the enclosing function is
  never closed and the routes after it are unreachable. `platformCoreRoutes` registered 5 of
  15, `unifiedAIRoutes` 3 of 8, `labourRoutes` **0 of 7**. Seven files affected.
  `animalHealthRoutes` and `goatRoutes` additionally had `protectLivestockRouter(router)`
  disabled, so they ran without the hardening their livestock siblings had. Re-enabled.

**Consolidated:** `governanceModule` 1 → **25 endpoints live** (villages, panchayats, CSR,
compliance, cooperatives — the real implementation was filed as
`platform/governanceModule_merged.js` and published at a `-merged` URL nothing calls);
`costRoutes` 2 → 3; plus `aiGatewayRoutes`, `trackDartRoutes`, and `sapModuleArchitecture`'s
`/status` alias preserved.

**Second duplicate class found:** `dynamicRouteLoader.js` keys its registry by *basename* and
drops later files with a name it has seen, so a 39-line stub in a subfolder beat the real
top-level implementation on walk order. 12 cases, 64 routes unblocked.

**Retired 98** (86 `_merged` + 12 duplicate-basename stubs) under two rules — (A) every route
already present in the canonical file, 73; (B) in-memory CRUD scaffold whose canonical
counterpart is real service/DB-backed, 13 — both also requiring no requirer and no
`-merged` caller. All were git-tracked before deletion, so all are recoverable.

**Kept 11**, reasons recorded: `gdprRoutes_merged` (3 real GDPR endpoints), `libraryRoutes_merged`
(2), three holding a `/health` the canonical lacks, and six in-memory scaffolds whose canonical
counterpart is *also* a placeholder — retiring those would remove the only thing there, so they
are a build-out decision, not a retirement one.

**Verified:** 753 route files `node --check` clean; 0 load failures (was 6); live endpoint sets
match the pre-consolidation snapshot (three are supersets — an array-path route the static
scanner half-read, plus a mounted sub-router); 0 remaining stubs hiding a real implementation
(was 12); no dangling requires. Not run against a live database — infrastructure is down here.

**Follow-up:** the `_merged` suffix is itself the root cause — the loader turns it into a
`/api/v1/x-merged` URL nothing calls. The 11 kept files still carry it; the name should go when
their unique routes are merged.
