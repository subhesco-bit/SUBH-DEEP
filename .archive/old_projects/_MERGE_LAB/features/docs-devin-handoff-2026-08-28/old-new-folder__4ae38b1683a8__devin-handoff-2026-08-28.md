# Devin Handoff — Module & Interface Wiring (2026-08-28)

Full context for the session triggered via `backend/scripts/trigger_devin_handoff.js`. Everything below was verified by running the actual code this session, not inferred from reading it.

## Where things stand

| Metric | Value |
|---|---|
| Modules registered, Claude-discoverable | 302 |
| Verified loadable/executable | 189+ |
| Frontend domains that had zero backend route | 91 |
| Of those, have real backend code | 40 |
| Of those, are genuinely empty (need real backend) | 50 |
| Have a real backend under the **wrong assumed ID** | ~19 |

## Done and verified this session

- **Claude AI integration layer**: module registry (discover/load/execute), search ranking, a circular-dependency crash fix (`M002_USER_MANAGEMENT` <-> `M003_ORGANIZATION` recursed forever and OOM-crashed the process before the fix), a prototype-chain adapter bug fix — all live at `/api/v1/ai/modules/*`.
- **Generic backend-module REST bridge**: `backend/src/routes/claude/backendModuleBridge.js`, mounted at `/api/v1/backend-modules/:moduleId/:operation/:id?`. Exposes any `backend/src/modules/M0XX` module's real exported functions over HTTP. Arity-aware: dispatches `fn(payload)` vs `fn(id, payload)` based on the real function's `Function.length`, not a guess — this matters because many real functions take `(id, data)` while others take a single merged object.
- **Generic frontend operation panel**: `frontend/src/components/common/ModuleOperationPanel.jsx` — introspects a module's real operations (`GET /api/v1/backend-modules/:moduleId`) and renders a working call-form for each. Use this for any module without a bespoke UI yet, rather than hand-building a form.
- **Water domain (M076–M080)**: `WaterManagementPage.jsx` fully rebuilt around the real action-oriented functions (`createWaterBudget`, `trackWaterUsage`, etc.) — the previous version assumed a CRUD shape (`getBudgets`/`updateBudget`/`deleteBudget`) that never existed on the backend. This is the reference pattern for step 2 below.
- **10 new pages**: FPO Registration (M051), Cattle Registry (M122), Implement/Equipment Inventory/Equipment Rental/Breakdown Maintenance/Fuel/Spare Parts/Asset Lifecycle Management (M102–M110), Environment Management (M005) — all verified real-domain matches (file header + exports checked, not assumed from the frontend comment), routed through `ModuleOperationPanel`.
- **5 orphaned AI/security components**: MFA, GDPR, Library browser, AI chat, AI collaboration — routed and reachable.
- Backend boots clean, frontend builds clean (3192 modules, 0 errors) as of this handoff.

## Step 1 — 3 pages, API-client-only fix

These pages are already well-built (real forms, react-query, etc.) and their assumed shape genuinely matches the real backend. Only `services/api.js`'s client functions need to point at the bridge instead of paths that were never built.

| Page | Module | Real functions |
|---|---|---|
| `OrchardManagementPage.jsx` (`orchardAPI`) | `M141` | `listOrchards`, `getOrchard`, `createOrchard`, `updateOrchard`, `deleteOrchard`, `getOrchardProduction`, `recordOrchardProduction`, `getOrchardAnalytics` |
| `PondManagementPage.jsx` (`pondAPI`) | `M132` | `listPonds`, `getPond`, `createPond`, `updatePond`, `deletePond`, `configurePondSensors`, `getPondSensorData`, `getPondHealthIndex`, `getPondAIInsights` |
| `FarmerHealthWelfarePage.jsx` (`farmerWelfareAPI`) | `M029` | `listHealthRecords`, `getHealthRecord`, `createHealthRecord`, `updateHealthRecord`, `deleteHealthRecord`, plus `getFarmerHealthSummary`, `getWelfarePrograms`, `enrollWelfareProgram` |

Route pattern: `GET /api/v1/backend-modules/M141/getOrchard/{id}`, `POST /api/v1/backend-modules/M141/createOrchard` (body = payload), `PUT /api/v1/backend-modules/M141/updateOrchard/{id}` (body = payload), `DELETE /api/v1/backend-modules/M141/deleteOrchard/{id}`.

## Step 2 — 2 pages, rewrite needed

The pages assume CRUD; the real backend doesn't have one. Follow `WaterManagementPage.jsx`'s pattern (action cards with real params, not a fabricated list/create/update/delete).

| Page | Module | Real functions (not CRUD) |
|---|---|---|
| `VillageRegistryPage.jsx` | `M041` | `createVillage`, `addVillageResource`, `getVillageAnalytics` — no list/update/delete |
| `PoultryManagementPage.jsx` | `M123` | `registerPoultryFlock`, `updateFlockHealth`, `trackFlockPerformance`, `generatePoultryReport` — no list/delete |

## Step 3 — CRITICAL: verify before wiring, don't trust the frontend's claimed domain

The single most important finding of this session's frontend pass: **a module's number does not reliably indicate its domain.** The frontend's own code comments (`services/api.js`) were generated against a different catalog's numbering than `backend/src/modules/M0XX` actually uses. Confirmed by reading actual file headers — not by trusting the label.

| Frontend claims | Module | Actually contains |
|---|---|---|
| FPO Governance | `M052` | Product Catalog Service |
| FPO Marketing | `M057` | Shipping Management Service |
| Block / District / State Management | `M043` / `M044` / `M045` | Crop Registration / Crop Variety / Seed Planning |
| Nutrient / Fertility Management (soil) | `M073` / `M074` | Goat Management / Sheep Management |
| Drought / Flood Monitoring | `M085` / `M086` | Comparative Analytics / Real-time Monitoring |
| Role / Permission / SSO / Digital Identity / Consent / Session (6 modules) | `M014`–`M020` | SSO / MFA / Identity Federation / Privacy Controls / Profile Management / Account Recovery — all real, just mislabeled |
| Feature Flag / Time Zone / Master Config | `M007` / `M009` / `M010` | Role & Permission (**already merged into `modules/M004_ROLE_MANAGEMENT`** this session — don't re-merge) / Security & Access Control / Notification System |
| Irrigation Management | `M075` | Pig Management (the water page already excludes this tab, not currently at risk) |

None of these were wired this session — correctly left alone rather than connected to the wrong backend. For each: check whether the real intended capability already exists somewhere else in the codebase (the way M007's real content turned out to already be merged into M004_ROLE_MANAGEMENT), before deciding to build new, re-point, or relabel the frontend claim.

## Step 4 — lowest priority: genuinely empty modules

Confirmed via line-count + content check (0–50 lines, boilerplate only — e.g. `// Add business logic here`, no real implementation):

```
M063 M064 M065 M066 M067 M068 M088 M089 M090 M091 M092 M094 M095 M096 M097
M099 M100 M106 M113 M114 M115 M116 M117 M119 M120 M124 M126 M129 M130 M131
M133 M134 M135 M136 M137 M138 M139 M140 M142 M143 M145 M146 M147 M149 M150
M048 M049 M093
```

These need real implementation built, not wiring — lowest priority, highest volume.

## Standing rules from this session (apply throughout)

1. **Verify by running the code, not by reading it.** "It looks right" is not "it works" — most of the real bugs found this session (broken imports, a `Pool` constructor bug that had been dead since it was written, the circular-dependency crash, two merge-collision bugs) were invisible from reading alone and only surfaced by actually executing the code.
2. **Merge, don't delete, when two implementations of the same capability exist.** Combine all real features into one surviving implementation; never just pick a winner and discard the other outright.
3. **Required sequence for any merge: copy → merge → verify it actually works → only then remove/overwrite the original.** Never do the removal in the same step as the merge — if the merge target turns out broken, the original needs to still be on disk to recover from. (This was learned the hard way this session: a premature overwrite created a circular require that silently produced zero merged functions.)
4. **Collision check on every merge.** If a merged-in function shares a name with something that already existed, read both real signatures. If they differ, keep both under distinct names (e.g. `getConfigurationHistory` vs `getConfigurationHistoryById`) rather than let one silently shadow the other — this exact bug broke two already-live routes this session before being caught.
5. **No fake completion.** Don't mark something done, wired, "production", or verified without having actually run it and seen the real result.
