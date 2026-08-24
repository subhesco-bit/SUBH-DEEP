---
agent: api-tester
status: fail
findings: 6
---

# API Contract Audit — AFRERA Backend

Static/code-level review only. No server was started and no live HTTP requests were made, per scope. All findings verified against the current working-tree state via `git diff`, `git show HEAD:...`, `require.resolve()` dry-checks (module resolution only — no code executed), and direct file reads.

## Summary

The backend cannot start in its current committed state. Two independent, unrelated fatal defects each individually crash the process before `app.listen()` is ever reached:

1. **82 `require()` calls in `backend/src/index.js` point to files that do not exist on disk** (routes/services referenced by name but never committed). The very first one is hit at line 42, so `node backend/src/index.js` throws `MODULE_NOT_FOUND` almost immediately.
2. **67 of the 150 generated `backend/src/modules/M0xx/` scaffold modules contain fatal `SyntaxError`s** in both their `routes.js` and `service.js` files (paired, 100% overlapping set). `index.js`'s module-loader loop (`index.js:472-482`) `require()`s every `M0xx` directory synchronously with no `try/catch`, so reaching the first broken module (`M012`, alphabetically first offender) would also independently crash the process.

Beyond the two startup blockers, one confirmed runtime bug (`insuranceClaimsService.js:331`, a `ReferenceError` via variable-name collision) and one confirmed auth-model inconsistency were found in otherwise-working, committed route code. A frontend/backend contract gap (dairy/fertilizer APIs) was also confirmed absent.

Positive notes: the handful of routes that *do* work (`farmerRoutes.js`, `vendorRoutes.js`, the M0xx scaffold template itself, `insuranceClaimsService.js`'s POST routes) use a consistent `{ success: false, error: error.message }` error-body shape with appropriate status codes (400/404/500), and consistent `{ success: true, data }` on success.

Note on process: this audit was interrupted mid-run by a session-limit error. During the gap, `backend/src/index.js` and `backend/src/services/regionalVarietyService.js` were edited by another process from a broken `require('./')` self-reference state back to the current committed state (confirmed via `git diff HEAD` = empty for both files). All findings below reflect the **current** on-disk state, re-verified after the interruption, not the transient mid-edit state seen earlier in this session.

## Findings

### 1. CRITICAL — `backend/src/index.js` requires 82 files that do not exist; server cannot start

**Location:** `backend/src/index.js` (82 call sites; first and dispositive one is line 42)
**Severity:** Critical / blocker

`index.js` contains 82 relative `require()` calls whose target files are absent from the repository. Verified with a `require.resolve()` dry-check against every relative `require(...)` path in the file (module resolution only, nothing executed) plus manual `ls` spot-checks. All 82 confirmed missing. Representative sample (full list of 82 line numbers gathered during the audit):

```
index.js:42   require('./services/enterpriseMemoryService')   -- MISSING (first hit)
index.js:49   require('./services/whatsappService')            -- MISSING
index.js:68   require('./services/millCircuitService')         -- MISSING
index.js:97-104  require('./routes/ecommerce*Routes')          -- MISSING (8 files)
index.js:117  require('./routes/dairyRoutes')                  -- MISSING
index.js:118  require('./routes/fertilizerRoutes')             -- MISSING
index.js:121-125 require('./routes/{poultry,goat,sheep,pig,animalHealth}Routes') -- MISSING (5 files)
index.js:131-177 require('./services/{village,procurementSubscription,buyingClub,ruralEnterprise,
              renewableEnergy,householdEconomy,machineryAccess,ruralFinance,aiAdvisory,marketAccess,
              marketIntelligence,mobilityRides,backup,analyticsMonitoring,aiAgenticCompanion,
              aiAgent,aiBrain,aiSelfHealing,aiOperationIntelligence,sapModuleArchitecture,
              cloudManagement}Service')                          -- MISSING (20 files)
index.js:191-286 require('./routes/{climateAdvisory,geofencing,assetAccounting,costControl,
              projectSystems,coldStorage,dprGeneration,cooperativeShare,vision,aiGateway,aiAgent,
              aiBrain,aiSelfHealing,aiOperationIntelligence,sapModuleArchitecture,cloudManagement,
              serverManagement,databaseManagement,publicDomainDataExtraction,researchAndDevelopment,
              moduleSupportInfrastructure,startupEnvironment,informationSharing,community,knowledge,
              company,platformCore,platformConfiguration,tenantManagement,organizationManagement,
              systemAdministration}Routes')                      -- MISSING (~30 files)
index.js:303  require('./middleware/inputValidation')           -- MISSING (destructures validateBody)
index.js:495-572 require('./routes/{bulkOrder,completeERPIntegration,completeAIIntegration,
              comprehensiveERP,aiBackbone,farmerTraining,hr}Routes')  -- MISSING (7 files)
index.js:677  require('./graphql/schema')                       -- MISSING (gated by ENABLE_GRAPHQL env var — lower practical risk)
index.js:791  require('./core/nervousSystem')                   -- MISSING (destructures initializeNervousSystem, startSensorDataCollection; called unconditionally at lines 792-793)
```

Because these are plain `const x = require('./path')` statements evaluated top-to-bottom at module load, the **first** one — line 42, `./services/enterpriseMemoryService` — throws `MODULE_NOT_FOUND` and aborts the entire process before `app`, `express()`, middleware, or any route is ever registered. None of the working routes elsewhere in the codebase are reachable while this is unresolved.

Confirmed this is the current committed state: `git diff HEAD -- backend/src/index.js` is empty (0 lines changed), and `git show HEAD:backend/src/index.js | grep -c "require('./')"` returns 0, so this is not a leftover editing artifact — it is what is currently checked in.

**Remediation:** For each of the 82 entries, either (a) create the missing file with a real `router`/`setupRoutes` export, or (b) remove the `require()` and its corresponding `app.use()` / `mountRoute()` / `.setupRoutes()` call if the feature is genuinely not implemented yet. Do not re-introduce `require('./')` (bare self-reference) as a placeholder — that resolves to `index.js` itself and produces a different (also fatal) circular-require failure, which is what was observed transiently earlier in this session before being reverted.

---

### 2. CRITICAL — 67 of 150 generated `M0xx` modules have fatal `SyntaxError`s in both `routes.js` and `service.js`

**Location:** `backend/src/modules/{M012,M013,M015,M017,M021,M022,M023,M024,M025,M026,M027,M028,M029,M030,M031,M032,M033,M036,M040,M042,M043,M044,M045,M047,M048,M050,M052,M053,M054,M055,M056,M057,M058,M060,M071,M072,M073,M081,M082,M084,M085,M086,M090,M091,M092,M093,M094,M098,M099,M100,M106,M111,M114,M115,M117,M118,M119,M120,M124,M125,M126,M128,M137,M139,M144,M148,M149}/{routes.js,service.js}`
**Severity:** Critical / blocker (independent of Finding 1)

Every one of these 67 module pairs has two distinct syntax errors, always together (verified: the routes-bug set and the service-bug set are identical, 67/67 overlap):

a) `routes.js` — missing `=` before `require`:
```js
// backend/src/modules/M050/routes.js:4
const { authMiddleware , requireRole } require('../../middleware/auth');
//                                     ^ missing "="
```
This is not valid JavaScript (`SyntaxError: Unexpected identifier`) and cannot be parsed by Node.

b) `service.js` — SQL query template literals with the backticks and interpolation stripped out:
```js
// backend/src/modules/M013/service.js:9
const totalRes = await pg.query(SELECT COUNT(*) FROM );
// backend/src/modules/M013/service.js:11
const res = await pg.query(SELECT * FROM  ORDER BY created_at DESC LIMIT  OFFSET , [limit, offset]);
```
`SELECT`, `COUNT`, `FROM`, etc. are being parsed as bare JS identifiers/calls with a stray `*` argument — this is a hard `SyntaxError` (`Unexpected token '*'`), not a runtime SQL error. The file cannot be `require()`'d at all.

**Blast radius:** `backend/src/modules/M0xx/index.js` does `module.exports = { controller: require('./controller'), service: require('./service'), router: require('./routes') }` with no `try/catch`, and `backend/src/index.js:472-482` loops over every `M0xx` directory calling `require(...)` on it, also with no `try/catch`. The loop is in alphabetic order, so `M012` (the first broken module) would be the first one hit — this independently crashes the boot sequence with a `SyntaxError`, on top of Finding 1.

Confirmed pre-existing/committed: `git status`/`git diff` show no pending changes under `backend/src/modules/`, so this predates the current session's edits.

**Remediation:** Regenerate or hand-fix all 67 `routes.js` (`= require(` typo) and 67 `service.js` (restore the template-literal backticks and `${tableName}` / `${id}` interpolations that produce real parameterized SQL, e.g. `` pg.query(`SELECT COUNT(*) FROM ${tableName}`) ``) files. Given the scale, this reads like a batch code-generation bug (same template broke identically 67 times) rather than 67 independent hand edits — worth fixing at the generator/template level if one exists, not file-by-file.

---

### 3. HIGH — `insuranceClaimsService.js:331` references the wrong variable, causing a `ReferenceError` on every call

**Location:** `backend/src/services/insuranceClaimsService.js:331`, function `calculateClaimPayout`, reached via `GET /api/v1/insurance/claims/:id/payout` (route registered at `insuranceClaimsService.js:568`)

```js
// lines 318-331
const aiRequest = {
  task: 'payout_calculation',
  parameters: { ... }
};

const aiResponse = await aiAPI.generateRecommendation(aiResponse);
//                                                      ^^^^^^^^^^ should be aiRequest
```

`aiResponse` is declared with `const` on this same line, so referencing it in its own initializer hits the temporal dead zone: `ReferenceError: Cannot access 'aiResponse' before initialization`. Cross-checked against every other call site of `aiAPI.generateRecommendation` in the codebase (`dynamicPricingService.js`, `subsidyService.js`, `soilTestingService.js`, `greenhouseService.js`, `governmentSchemeService.js`, `sharedInfraService.js`, `farmerTrainingService.js`, `preSeasonOrderService.js`, and 4 other call sites within `insuranceClaimsService.js` itself) — all 30+ other call sites correctly pass `aiRequest`. This is an isolated single-site typo, not a systemic pattern.

Because the call is wrapped in the route's own `try/catch` (`insuranceClaimsService.js:568-575`), this degrades to a `500 { success: false, error: "Cannot access 'aiResponse' before initialization" }` response rather than crashing the process — but the endpoint is permanently broken as written.

**Remediation:** Change `aiAPI.generateRecommendation(aiResponse)` to `aiAPI.generateRecommendation(aiRequest)` at line 331.

---

### 4. MEDIUM — Inconsistent auth middleware within `insuranceClaimsService.js`'s own route set

**Location:** `backend/src/services/insuranceClaimsService.js:523-575`

```
523: app.post('/api/v1/insurance/claims/submit',        authMiddleware, ...)
532: app.post('/api/v1/insurance/claims/:id/process',   authMiddleware, ...)
541: app.post('/api/v1/insurance/claims/:id/followup',  authMiddleware, ...)
550: app.get('/api/v1/insurance/claims/:id/status',     (no authMiddleware)
559: app.post('/api/v1/insurance/claims/fraud-detect',  authMiddleware, ...)
568: app.get('/api/v1/insurance/claims/:id/payout',     (no authMiddleware)
```

All four `POST` mutation routes on this resource require `authMiddleware`; both `GET` routes (`/:id/status`, `/:id/payout`) do not. There is no ownership/ID-ownership check either, so — modulo Finding 3, which currently 500s the payout route — any unauthenticated caller can read the status and (once Finding 3 is fixed) the computed payout of any claim by guessing/enumerating `:id`. This is inconsistent with the write-side of the same resource and with sibling resources audited (`farmerRoutes.js` protects every route including reads, `vendorRoutes.js` likewise).

**Remediation:** Add `authMiddleware` (and, if claims are farmer-owned, an ownership check comparable to `resolveFarmerId` used in `farmerRoutes.js`) to both GET routes, or document explicitly why claim status/payout are intentionally public.

---

### 5. MEDIUM — Frontend calls dairy/fertilizer endpoints backed by route files that do not exist

**Location:** `frontend/src/services/api.js:1436-1464` (`dairyAPI`, `fertilizerAPI`) vs. `backend/src/index.js:117-118, 530-531`

```js
// frontend/src/services/api.js
export const dairyAPI = {
  getAnimals: (params) => api.get('/dairy/animals', { params }),
  createAnimal: (data) => api.post('/dairy/animals', data),
  ...
}
export const fertilizerAPI = {
  getInventory: (params) => api.get('/fertilizer/inventory', { params }),
  ...
}
```

`index.js:117-118` requires `./routes/dairyRoutes` and `./routes/fertilizerRoutes`; neither file exists anywhere under `backend/src` (confirmed via `find` and `require.resolve`), despite an inline comment at `index.js:526-527` and `frontend/src/services/api.js:1449-1454` both asserting a "real backend" exists for these. This is a subset of Finding 1 but called out separately because it is a directly-verifiable frontend/backend contract break: every `dairyAPI.*` / `fertilizerAPI.*` call from the frontend will fail (404, or — until Finding 1 is fixed — the whole API is unreachable).

**Remediation:** Create `backend/src/routes/dairyRoutes.js` and `backend/src/routes/fertilizerRoutes.js` (and the `fertilizerInventoryService.js` referenced in the surrounding comment) implementing the 4 dairy + 6 fertilizer endpoints the frontend already calls, backed by the existing `065_dairy_management_schema.sql` / `066_fertilizer_inventory_schema.sql` migrations (both present under `backend/src/database/migrations/`), or remove/stub the frontend calls until the backend exists.

---

### 6. LOW / Informational — Auth model diverges between the two working `M0xx` modules and the template used by the 67 broken ones

**Location:** `backend/src/modules/M006/routes.js`, `M011/routes.js` vs. `backend/src/modules/{M050,M100,...}/routes.js` (the 67 broken-but-recoverable modules from Finding 2)

The only two `M0xx` modules with real (non-stub) routes that currently parse — `M006` (system settings) and `M011` (user management) — gate every single route, including `GET`, behind `authMiddleware` + `requireRole('admin')`. The template used by the 67 syntax-broken modules (e.g. `M050`, `M100`) instead leaves `GET /` and `GET /:id` public and only gates `POST`/`PUT`/`DELETE`:

```js
// M050/routes.js pattern (once the "= require" typo in finding 2 is fixed)
router.get('/', controller.list);              // public
router.get('/:id', controller.get);             // public
router.post('/', authMiddleware, requireRole(...), controller.create);
```

This isn't necessarily wrong (public-read/protected-write is a defensible default for some resources) but it is a different authorization model than the two modules that actually work today, and it's baked into a template that's about to be reproduced 67 times once Finding 2 is fixed. Worth an explicit decision per module (which of the 150 `M0xx` resources should be public-read) rather than inheriting whatever the scaffold happened to default to.

**Remediation:** When fixing Finding 2, review whether public-GET is intentional per module rather than mechanically restoring the current broken template as-is.

---

## Metrics

| Metric | Count |
|---|---|
| Express route handlers found (`router.*`/`app.*` across all verbs) | 1289 |
| — GET | 678 |
| — POST | 504 |
| — PUT | 108 |
| — DELETE | 81 |
| — PATCH | 3 |
| Route/service files under `backend/src/routes/` | 39 |
| Route/service files under `backend/src/services/` | 107 |
| Generated modules under `backend/src/modules/` (M001-M150) | 150 |
| — modules with fatal SyntaxError (routes.js + service.js) | 67 |
| — modules that are pure unimplemented stubs (comment-only) | 81 |
| — modules with real, currently-parseable routes | 2 (M006, M011) |
| Files containing `authMiddleware` | 161 |
| `require()` targets in `index.js` resolving to nonexistent files | 82 of ~200 relative requires |
| Confirmed runtime bugs in otherwise-working route code | 1 (`insuranceClaimsService.js:331`) |
| Confirmed frontend/backend contract breaks | 1 (dairy/fertilizer APIs) |

*verified by vibecheck*
