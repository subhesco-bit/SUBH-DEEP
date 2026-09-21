# API -> Module -> UI Linkage Audit

**Date:** 9 September 2026  
**Mode:** Read-only, because development is paused for Devin integration.

## Validation Results

| Check | Result | Evidence |
|---|---|---|
| Backend route coverage audit | Failed | 346 route files found; 196 imported; 1 missing import; 146 orphaned files |
| Backend entrypoint import | Failed | `completeAIIntegrationController.js` imports missing `services/legacy/completeAIIntegrationService` |
| SAP route linkage | Failed | `index.js` imports `routes/sapModuleArchitectureRoutes.js`, but only `routes/platform/sapModuleArchitectureRoutes.js` exists |
| Frontend lazy page import audit | Passed | 0 missing page files found for imports in `frontend/src/config/routes.js` |
| Frontend production build | Blocked | `vite` executable unavailable in `frontend` dependency installation |
| Source edits | None | Audit-only mode preserved the Devin pause |

## Critical Findings

### 1. Backend cannot be certified bootable

The backend entrypoint fails during module loading because:

```text
Cannot find module ../services/legacy/completeAIIntegrationService
```

This blocks all route smoke tests and production boot validation. The missing
service must be reconciled with existing complete-AI service implementations;
do not create a duplicate until the canonical owner is identified.

### 2. SAP module route import is incorrect or incomplete

`backend/src/index.js` references:

```text
./routes/sapModuleArchitectureRoutes.js
```

The repository contains:

```text
backend/src/routes/platform/sapModuleArchitectureRoutes.js
```

The import/mount path and route ownership need reconciliation after Devin work.

### 3. Route inventory is not equivalent to route integration

The route audit reports 146 orphaned files. Some may be intentional aliases,
tests, generated routes, or routes mounted through aggregate routers; others may
be genuine missing API surfaces. Each must be classified before mounting:

- canonical and production-required
- aggregate-mounted
- intentionally internal
- generated or test-only
- duplicate/legacy
- genuinely missing

Blindly mounting all 146 would create duplicate endpoints and security risk.

### 4. Frontend route files are present, but build proof is unavailable

The centralized lazy import scan found no missing page files. This proves file
resolution only; it does not prove API contract correctness, backend route
mounting, authorization, or runtime rendering.

The production build is currently blocked because `vite` is not available in
the frontend installation. Dependencies must be restored only after the Devin
integration boundary is approved.

## Required Post-Devin Fix Order

1. Resolve the missing `completeAIIntegrationService` through canonical service
   ownership and add an import test.
2. Reconcile the SAP route path and add a route-mount test.
3. Classify all 146 orphaned routes using aggregate-router evidence.
4. Build an API contract map: frontend service method -> backend method/path ->
   controller/service -> auth/role policy -> migration/table.
5. Fix only confirmed missing links and remove duplicate ownership.
6. Restore frontend dependencies and run the production build.
7. Run backend boot, route smoke, targeted tests, frontend build, accessibility
   checks, responsive checks, and production smoke validation.
8. Apply shared visual/UX improvements only after linkage correctness is proven.

## Deferred Shared UX Review

The concept requires consistent responsive layouts, keyboard operation, visible
focus states, 48px touch targets, simple/kiosk modes, multilingual empty-state
honesty, loading/error states, and role-aware navigation. These should be
implemented as shared primitives after the API/module/UI map is stable.
