---
agent: ui-auditor
status: warn
findings: 5
---

# UI/UX audit

## Summary

The shared shell has a solid baseline (skip link, labelled navigation, reduced-motion support, and error boundaries), but one systemic responsive bug and mobile fixed-position overlap risk affected every screen. Surgical shared fixes were applied without changing business screens.

## Findings

### 1. High — viewport breakpoints were written as container queries (fixed)

- **Location:** `frontend/src/styles/responsiveDesign.css`
- **Description:** `@container` rules were used for viewport breakpoints, but no containing contexts are established. Grid, visibility, spacing, typography, and card-grid utilities could therefore fail to adapt at documented widths.
- **Remediation:** Converted all 28 breakpoint blocks to `@media` queries.

### 2. High — fixed mobile navigation could cover page content (fixed)

- **Location:** `frontend/src/components/Layout.jsx`, `frontend/src/components/BottomNav.jsx`
- **Description:** The fixed bottom bar had no content inset, so the last controls in long forms/tables could sit underneath it. Notched devices also lacked a safe-area inset.
- **Remediation:** Added mobile-only main bottom padding, `z-sticky`, horizontal padding, and `env(safe-area-inset-bottom)` support.

### 3. Medium — route loading was not consistently announced (fixed)

- **Location:** `frontend/src/components/RouteLoading.jsx`
- **Description:** Route fallbacks were visual-only; screen-reader users had no reliable status that navigation was still loading.
- **Remediation:** Added `role="status"`, `aria-live="polite"`, and `aria-busy="true"` to the route loading fallbacks.

### 4. Medium — skeleton geometry could create assistive-technology noise (fixed)

- **Location:** `frontend/src/components/ui/Skeleton.jsx`
- **Description:** Repeated decorative skeleton `div`s can be traversed as meaningless content while loading.
- **Remediation:** Marked the base skeleton geometry `aria-hidden`.

### 5. Medium — footer social controls are dead placeholder links (open)

- **Location:** `frontend/src/components/Footer.jsx:21-31`
- **Description:** Social icons use `href="#"`; activating them changes the URL/scroll position without opening a destination.
- **Remediation:** Replace with verified organization URLs, or render them as non-interactive marks until destinations exist. Do not ship `#` placeholders.

## Additional consistency improvements

- Added a shared `:focus-visible` ring in `frontend/src/index.css`, including components that suppress the browser outline.
- Added `min-w-0` to the shared main flex child to prevent long module content from forcing page-level horizontal overflow.

## Metrics

- Shared areas reviewed: layout, header, sidebar, bottom navigation, footer, route loading, skeletons, accessibility provider, and responsive styles.
- Breakpoint blocks corrected: **28**
- Shared files changed: **6**
- Business/page-specific screens redesigned: **0**
- Validation: `npm run lint` and `npm run build` were attempted from `frontend/`, but this checkout has no installed dependencies (`eslint` and `vite` were not found).
