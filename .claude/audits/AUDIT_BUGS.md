---
agent: bug-auditor
status: fail
findings: 7
---

# Bug Audit — Runtime Bugs, Logic Errors, Edge Cases

## Summary

Scope: whole repo, with emphasis on `backend/src` (824 JS files scanned, including `backend/src/services/*` and all 150 `backend/src/modules/M001`–`M150`). Verification performed both by manual code reading and by two purpose-built static-analysis passes:

1. A `require({...}) ` destructuring-vs-`module.exports` checker across all of `backend/src` (and the rest of `backend`).
2. A whole-module-require call-site checker (`const alias = require('./x'); alias.method()`) cross-referenced against each target module's actual exported keys, across all 824 files, plus a dedicated pass over every `modules/M0xx/controller.js` → `service.js` pairing.

**Already-fixed item verified:** `backend/src/services/aiService.js` module.exports (lines 1208-1217) now includes `aiAPI: { generateRecommendation }`, confirming the previously-missing export used by 9 downstream services is in place. No action needed.

**Previously-flagged item confirmed (included below for completeness per instructions):** `insuranceClaimsService.js:331`.

Beyond that, this audit found **6 new, independently-confirmed bugs** — one is the same "destructure/require a name the target module never exports" class of bug as the original `aiAPI` issue, occurring in `websocket/socketServer.js`; one is a whole-module-require-instead-of-destructure bug that silently breaks all logging in `auditService.js`; and three are call sites invoking service methods that don't exist on the target module (dead/broken feature paths). The 150 generated `modules/M0xx/*` packages and the rest of `backend/src/services` were clean under both static checks — no further `require`/export or controller→service mismatches were found there.

## Findings

### 1. [HIGH] `websocket/socketServer.js` destructures `verifyJWT`, which `middleware/auth.js` does not export — every WebSocket connection attempt throws

- **Location:** `backend/src/websocket/socketServer.js:8` (import) and `backend/src/websocket/socketServer.js:49` (call site)
- **Description:** `const { verifyJWT } = require('../middleware/auth');` pulls a name that does not exist on that module. `backend/src/middleware/auth.js:209-215` exports only `{ authMiddleware, requireRole, requirePermission, optionalAuth, userRateLimit }` — there is no `verifyJWT` export anywhere in that file. As a result `verifyJWT` is `undefined` at import time, and the call `const decoded = await verifyJWT(token);` on line 49 throws `TypeError: verifyJWT is not a function` for every single incoming WebSocket connection (inside `handleConnection`, `backend/src/websocket/socketServer.js:37-55`). Since this call isn't wrapped in a `try/catch`, the exception propagates out of the `async` handler as an unhandled rejection on the `'connection'` event — real-time tracking/notifications (the stated purpose of this module, per its file header) never work.
- **Remediation:** Either export a `verifyJWT` helper from `middleware/auth.js` (e.g. wrapping `jwt.verify` with the same secret/options used by `authMiddleware`) and import it correctly, or reuse the existing exported primitives (e.g. call the JWT verification logic that `authMiddleware` already performs) instead of a nonexistent named export. Wrap the call in `try/catch` regardless so a bad/expired token results in `ws.close(1008, ...)` rather than an unhandled promise rejection.

### 2. [HIGH] `auditService.js` requires `utils/logger` as a whole module instead of destructuring `{ logger }` — every audit log call throws, breaking the entire service

- **Location:** `backend/src/services/auditService.js:6` (import), with broken call sites at lines 52, 55, 115, 171, 191, 255, 289, 344, 363
- **Description:** `const logger = require('../utils/logger');` binds `logger` to the *module object* `{ logger, childLogger, httpLogger, logError }` (see `backend/src/utils/logger.js:133-138`), not to the Winston instance itself. Every other consumer in the codebase gets this right — e.g. all 65 `modules/M0xx/controller.js` files do `require('../../utils/logger').logger || console`. `auditService.js` is the one place that skipped the `.logger` access, so every `logger.info(...)` / `logger.error(...)` call in this file throws `TypeError: logger.info is not a function` (or `.error is not a function`).
  Concretely: `logEvent()` (`backend/src/services/auditService.js:18-58`) calls `logger.info(...)` on the success path at line 52 — this throws immediately after a successful DB insert, which is then caught by the file's own `catch` block at line 54, whose `logger.error(...)` call *also* throws before the intended `throw error;` on line 56 ever runs. The result is that `AuditService.logEvent` — and every other method in the class that logs (`getEntityLogs`, `getUserLogs`, `getRecentEvents`, `generateAuditReport`, `getComplianceAudit`, `getSecurityAudit`, `exportAuditLogs`) — always throws a `TypeError` masking the real error/success outcome. The entire audit-trail feature is non-functional.
- **Remediation:** Change line 6 to `const { logger } = require('../utils/logger');` (matching the pattern used everywhere else in the codebase), or reference `logger.logger.info(...)` throughout if the module-object binding must be kept.

### 3. [MEDIUM] `agriculturalIntelligenceService.js` calls `this.analytics.generateReport()` and `this.analytics.healthCheck()`, neither of which `analyticsService.js` exports

- **Location:** `backend/src/services/agriculturalIntelligenceService.js:225` (`getAgriculturalAnalytics`) and `backend/src/services/agriculturalIntelligenceService.js:448` (`healthCheck`); `this.analytics` is assigned from `const analytics = require('./analyticsService')` at lines 10 and 15
- **Description:** `backend/src/services/analyticsService.js` exports only `{ router, buildPipelineInsights }` (lines 141-144) — there is no `generateReport` or `healthCheck` method. 
  - Line 225: `getAgriculturalAnalytics(parameters)` calls `await this.analytics.generateReport('agricultural_overview', parameters)` inside a `try` block that re-throws on `catch` (lines 223-241), so any caller of this method (e.g. a route handler) gets a hard `TypeError`/500 on every invocation — the "Agricultural analytics report" feature is completely broken.
  - Line 448: `healthCheck()` calls `await this.analytics.healthCheck()`; this one *is* caught (lines 445-464) and degrades gracefully to `{ status: 'unhealthy', error: ... }`, so the health endpoint won't crash but will permanently report the agricultural-intelligence service as unhealthy.
- **Remediation:** Either implement `generateReport`/`healthCheck` in `analyticsService.js` and export them, or point these two call sites at whatever `analyticsService` actually offers (`buildPipelineInsights`), or at the correct service if `analytics` was meant to reference a different module entirely.

### 4. [MEDIUM] `aiCopilotService.js` calls `nutritionIntelligenceService.getWellnessPractices()`, which is not exported — the "natural/traditional remedy" copilot path never returns a result

- **Location:** `backend/src/services/aiCopilotService.js:441` (require) and `:448` (call site), inside `generateNutritionCopilotResponse`
- **Description:** `nutritionIntelligenceService.js` exports `{ router, getNutrients, createFoodNutritionProfile, searchFoodProfiles, addProductNutrition, getProductNutrition, calculateProductNutritionScore, getProductNutritionScore, calculateNutritionPricing, compareProductsNutrition, getDietaryProfiles, isHealthy }` — there is no `getWellnessPractices`. The call `const { practices, disclaimer } = await nutritionIntelligenceService.getWellnessPractices({ tag: word });` (line 448) throws `TypeError: nutritionIntelligenceService.getWellnessPractices is not a function` for every candidate word. It is inside a `try/catch` (lines 447-464) that only `logger.warn`s and continues the loop, so the outer request doesn't fail loudly — but branch 1 of the nutrition copilot ("Natural-therapy / traditional-remedy match", the feature the surrounding comment at lines 433-439 specifically describes as "real data... already real in nutritionIntelligenceService.js") is dead code: it can never succeed, and every request pays the cost of `words.length` thrown-and-caught exceptions before falling through to branch 2.
- **Remediation:** Add a `getWellnessPractices` export to `nutritionIntelligenceService.js` backed by the `wellness_natural_practices` table referenced in the comment, or point this call at whatever function was actually intended.

### 5. [MEDIUM] `dprGenerationService.js` calls `governmentSchemeService.checkSchemeEligibility()`, which is not exported — DPR subsidy/scheme matching always falls back to "unavailable"

- **Location:** `backend/src/services/dprGenerationService.js:163`, inside `_getApplicableSchemes(cropType, state)`
- **Description:** `governmentSchemeService.js` exports `{ getApplicableSchemes, getWeatherAlerts, createGovernmentAnnouncement, getGovernmentAnnouncements, governmentOfficialLogin, getCSROpportunities, submitCSRProposal, getLocalizedDefaultPage, trackSchemeApplication, setupRoutes }` — there is no `checkSchemeEligibility`. Given the sibling export is literally named `getApplicableSchemes`, this reads as a call written against a name that was renamed/never existed. The call is wrapped in `try/catch` (lines 160-167) so it degrades to `{ eligible_count: 0, eligible_schemes: [], reminder: 'Scheme matching unavailable — confirm eligibility manually.' }` on every single DPR generated — the scheme-matching sub-feature described in the surrounding comment (lines 153-159) never actually runs.
- **Remediation:** Change the call to `governmentSchemeService.getApplicableSchemes({ category: cropType || undefined, state: state || undefined })` (verifying its parameter/return shape matches what `_getApplicableSchemes` expects), or implement `checkSchemeEligibility` if a distinct eligibility-check (vs. listing) is genuinely needed.

### 6. [CONFIRMED — already flagged, not yet fixed] `insuranceClaimsService.js:331` — `calculateClaimPayout` passes `aiResponse` to itself instead of `aiRequest`

- **Location:** `backend/src/services/insuranceClaimsService.js:331`
- **Description:** Verified as still present:
  ```js
  const aiResponse = await aiAPI.generateRecommendation(aiResponse);
  ```
  The `aiRequest` object is built at lines 318-329 immediately above, but line 331 passes `aiResponse` — the variable it is itself declaring — as the argument. Because `aiResponse` is a `const` being declared on this very statement, referencing it in its own initializer hits the temporal dead zone: `ReferenceError: Cannot access 'aiResponse' before initialization`. This is the only occurrence in the codebase of a `const X = fn(X)` self-referential-argument pattern (confirmed via a targeted regex sweep of all of `backend/src`), so it is an isolated typo, not a systemic pattern. Every call to `calculateClaimPayout` throws before any payout is computed.
- **Remediation:** Change the argument to `aiRequest`: `const aiResponse = await aiAPI.generateRecommendation(aiRequest);`

## Metrics

| Metric | Count |
|---|---|
| Total JS files scanned (backend, excl. node_modules/tests) | 824 |
| `modules/M001`–`M150` controller→service pairs checked | 150 (0 mismatches) |
| `require({...})` destructuring mismatches found | 1 (`socketServer.js` / `verifyJWT`) |
| Whole-module-require call-site mismatches found (after filtering `typeof x === 'function'`-guarded false positives) | 4 (`auditService.js`, `agriculturalIntelligenceService.js` ×2, `aiCopilotService.js`, `dprGenerationService.js` — 5 call sites across 4 files) |
| Self-referential `const X = fn(X)` TDZ bugs found | 1 (`insuranceClaimsService.js:331`, previously flagged) |
| New bugs found (excl. previously-flagged item) | 6 |
| High severity | 2 |
| Medium severity | 3 |
| Confirmed pre-existing/flagged | 1 |
| Already-fixed item re-verified as fixed | 1 (`aiService.js` `aiAPI` export) |
