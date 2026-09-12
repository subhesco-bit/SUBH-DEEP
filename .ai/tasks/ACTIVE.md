# 📋 ACTIVE TASKS — REAL-TIME TRACKING

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

**Next up after the 22-pair audit (by orphan count, highest first):**
- `ecommerce-marketplace` — 1,562 stems, 775 orphaned
- `ai-chat-copilot` — 1,761 stems, 845 orphaned (mostly agent-workspace noise per keyword
  classification — needs noise-filtering before trusting the count)
- `database-model` — 310 stems, 304 orphaned (near-total; highest-risk track)
- `mobile-shell`, `dietitian-nutrition`, `dynamic-pricing`, `public-price-extraction`,
  `voice-farmer`, `desktop-shell`

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
