---
agent: ui-auditor
status: warn
findings: 8
---

# UI/UX Audit — AFRERA Frontend

## Summary

The frontend (`frontend/src`) is a React + Vite + Tailwind app built on Radix UI primitives
(`frontend/src/components/ui/*`), with ~150 near-identical stub "module" pages
(`frontend/src/modules/M001`–`M150`, mostly redirect stubs to `ModuleHubPage.jsx` and out of
scope for meaningful UI findings) plus ~100 real feature pages under `frontend/src/pages/` and
shared chrome in `frontend/src/components/` (`Header.jsx`, `Sidebar.jsx`, `BottomNav.jsx`,
`Layout.jsx`, `Footer.jsx`).

The foundations are notably good: Radix-based primitives give correct semantics and focus
management for free (`dialog.jsx`, `select.jsx`, `tabs.jsx`, `label.jsx`), `Layout.jsx` has a
working skip-link and `focus-visible` rings are applied consistently, `Header.jsx`/`Sidebar.jsx`/
`BottomNav.jsx` use `aria-current`, `aria-expanded`, `aria-haspopup` and `aria-label` correctly in
most places, and `AccessibilityProvider.jsx` implements genuine access-mode support (simple/kiosk/
voice/sms) including `prefers-reduced-motion` handling. Data tables are consistently wrapped for
horizontal scroll on mobile.

Against that foundation, two systemic gaps stand out because they repeat across dozens of files
rather than being one-off bugs: (1) primary navigation dropdown menus are mouse-hover-only and
unreachable by keyboard, and (2) the vast majority of form `<label>` elements across the
"management" pages are visually adjacent to their input but not programmatically associated with
it (no `htmlFor`/`id`, no nesting) — meaning screen-reader and voice-control users are not told
what a focused field is for. A smaller set of icon-only buttons lack accessible names, and a
number of pages have no responsive breakpoint classes at all.

## Findings

### 1. [HIGH] Primary navigation dropdown menus are unreachable by keyboard
**Location:** `frontend/src/components/Header.jsx:32-55, 58-93, 96-113, 120-146, 164-185, 187-210, 212-229, 261-293`

Every top-nav dropdown ("Marketplace", "Farmer Portal", "Pricing", "Finance / ERP", "Vendor
Portal", "Admin", "Enterprise", and the authenticated user menu) is built as:

```jsx
<div className="relative group">
  <button className="..." aria-haspopup="true">...</button>
  <div className="absolute ... hidden group-hover:block">
    <Link to="/marketplace">Browse Products</Link>
    ...
  </div>
</div>
```

The trigger `<button>` has `aria-haspopup="true"` but no `onClick`/`onKeyDown` handler and no
`aria-expanded` state — it does nothing when activated by Enter/Space. The menu itself is
revealed only via CSS `group-hover:block` (no `group-focus-within:block` or JS-driven open
state), and while `hidden` (i.e. `display:none`), its child `<Link>`s are not part of the tab
order at all. A keyboard-only user (or anyone using a screen reader without a pointer) can
Tab past every one of these triggers but has no way to reveal or reach the 30+ destination
links nested inside them (Browse Products, Discover, Price Check, Compare, Pre-Orders, all
Farmer Portal links, Pricing Tools, Finance/ERP, Dashboard/Wallet/Bank Passport/Logout, etc).
This is the single largest navigation surface in the header and is currently mouse-only.

The mobile menu (`frontend/src/components/Header.jsx:325-580`) does not have this problem — it
is state-driven (`mobileMenuOpen`) and every link is a real, always-tabbable `<Link>`, but that
only helps users under the `md:hidden` breakpoint.

**Remediation:** Drive the seven desktop dropdowns off real state (or Radix `DropdownMenu`,
already a dependency of this codebase per `select.jsx`/`dialog.jsx`), toggle on click/Enter/Space,
set `aria-expanded` on the trigger, and stop relying on `group-hover` as the only way to reveal
the panel — at minimum add `group-focus-within:block` so Tab can open it, though a JS-driven
open/close with `Escape`-to-close is the correct fix to also fix mobile/touch (hover doesn't
exist on touch devices either, so this same markup likely also fails on tablets without a mouse).

---

### 2. [HIGH] Form labels are visually adjacent but not programmatically associated with their inputs
**Location:** Pervasive across `frontend/src/pages/*ManagementPage.jsx` and similar CRUD forms — representative sample:
- `frontend/src/pages/TractorManagementPage.jsx:229-262` (Registration No., Model, Horsepower, Owner name, Status, Hourly rate)
- `frontend/src/pages/SowingManagementPage.jsx:133, 219-276` (Season, Crop, Variety, Field name, Area, Season, Sowing method, Sowing date, Expected germination, Seed rate, Notes)
- and the same pattern in `VillageRegistryPage.jsx`, `FertilizerInventoryPage.jsx`, `FarmerSellPage.jsx`, `FarmerKycPage.jsx`, `LandRegistryPage.jsx`, `LabourManagementPage.jsx`, `IrrigationManagementPage.jsx`, `ClimateAdvisoryPage.jsx`, `CheckoutPage.jsx`, `DairyManagementPage.jsx`, `ShgManagementPage.jsx`, `FarmerFieldPage.jsx`, `FarmCostingPage.jsx`, `CorporateBuyerPage.jsx`, `B2BMarketplace.jsx`, `OrchardManagementPage.jsx`, `PriceBuildPage.jsx`, `PreOrderPage.jsx`, `PondManagementPage.jsx`, `MarketplacePage.jsx`, `CompetitivePositionPage.jsx`

A repository-wide search finds **230 `<label>` elements but only 16 `htmlFor=` attributes** (in
just 6 files: `WalletPage.jsx`, `ExperienceLayerPage.jsx`, `DataPrimitives.jsx`, `LoginPage.jsx`,
`RegisterPage.jsx`, `CompetitivePositionPage.jsx`). Everywhere else the pattern is:

```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Registration No. *</label>
  <input value={form.registration_no} onChange={...} className="..." />
</div>
```

The `<label>` is a sibling of the `<input>`, not wrapping it, and neither element has a
matching `id`/`htmlFor` pair. Sighted mouse users don't notice anything wrong because the label
sits directly above the field, but a screen reader announces the focused input with no name at
all (or falls back to `placeholder`, which many of these inputs also lack), and clicking the
label text does not focus/check the associated control. This affects essentially every
create/edit form across the "management" page family — dozens of pages, hundreds of fields.

**Remediation:** Either wrap the input in the label (`<label>Registration No.<input .../></label>`)
or add matching `id`/`htmlFor` pairs. Since the pattern is duplicated near-identically across ~30
files, this is a good candidate for a shared `<FormField label="..." >` wrapper component (one
fix, reused everywhere) rather than 30 individual edits — the existing `components/ui/label.jsx`
(Radix `Label`) is already correct and unused by these pages.

---

### 3. [MEDIUM] Icon-only buttons without an accessible name
**Location:**
- `frontend/src/pages/IrrigationManagementPage.jsx:182`, `VillageRegistryPage.jsx:135`, `TractorManagementPage.jsx:214`, `DairyManagementPage.jsx:237`, `SowingManagementPage.jsx:214`, `FertilizerInventoryPage.jsx:152`, `PondManagementPage.jsx:149`, `OrchardManagementPage.jsx:149`, `LandRegistryPage.jsx:200` — all identical: `<button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>` (modal close button)
- `frontend/src/pages/DiscoverPage.jsx:97-99` — `<button className="text-red-500 ..."><Heart className="w-5 h-5" /></button>` (favorite/wishlist toggle)
- `frontend/src/components/MobileOptimizedLayout.jsx:13-15, 29-31, 43-58` — back button, notifications bell, and all four bottom-nav icon buttons (Home/Market has a text label but Bell and back button do not)

None of these buttons have `aria-label`, visible text, or an `sr-only` span, so a screen reader
announces them only as "button" with no indication of what they do. This is a direct contrast
with `Header.jsx`, which gets this right consistently (e.g. `aria-label={mobileMenuOpen ? 'Close
menu' : 'Open menu'}` at `Header.jsx:315`, `aria-label="Cart, 0 items"` at `Header.jsx:252`) and
with `Layout.jsx`'s floating chat/voice buttons (`Layout.jsx:58, 65`), which also correctly set
`aria-label`. The modal-close-`<X>` pattern in particular is copy-pasted across at least 9
management pages with the missing label baked into every copy.

**Remediation:** Add `aria-label="Close"` (or more specific text) to each icon-only button, or add
an `sr-only` text node, matching the convention already used correctly in `Header.jsx` and
`Layout.jsx`.

---

### 4. [MEDIUM] A number of pages ship with no responsive breakpoint classes at all
**Location:** `frontend/src/pages/BankPassportPage.jsx`, `ClimateWeatherPage.jsx`,
`CompetitivePositionPage.jsx`, `CompliancePage.jsx`, `CorridorEconomicsPage.jsx`,
`ExperienceLayerPage.jsx`, `ForwardPricingPage.jsx`, `LandUseCarbonPage.jsx`, `LedgerPage.jsx`,
`LoginPage.jsx`, `RegisterPage.jsx`, `RfqPage.jsx`, `WalletPage.jsx`, `YieldManagementPage.jsx`

These 14 page files contain zero `sm:`/`md:`/`lg:` Tailwind prefixes, i.e. every layout,
grid-column-count and spacing value is fixed regardless of viewport width. Given the app is a
farmer-facing platform that elsewhere invests specifically in a mobile bottom nav
(`BottomNav.jsx`) and low-bandwidth/kiosk access modes (`AccessibilityProvider.jsx`), pages like
`LoginPage.jsx` and `RegisterPage.jsx` (first-run pages a new farmer hits) having no responsive
treatment is a real risk of horizontal overflow, oversized touch targets, or cramped multi-column
forms on small screens. Most other pages in `frontend/src/pages/` (85+ of them) do use
`grid-cols-1 md:grid-cols-2`-style responsive patterns, so this looks like an inconsistency
between pages rather than a deliberate desktop-only design.

**Remediation:** Spot-check these 14 pages at a 360–390px viewport width and add the same
`grid-cols-1 sm:grid-cols-2`/`md:` patterns used elsewhere in the codebase (e.g.
`MarketplacePage.jsx:193`, `ProductDetailPage.jsx:45`) for consistency.

---

### 5. [LOW] `MobileOptimizedLayout.jsx` is dead code with a divergent, less-accessible nav pattern
**Location:** `frontend/src/components/MobileOptimizedLayout.jsx` (entire file); confirmed via repo-wide search that no page imports it.

This component reimplements a mobile header + bottom nav (distinct from the app's actual mobile
nav, `BottomNav.jsx`, which is mounted globally in `Layout.jsx`), but:
- its bottom-nav buttons never track/announce the active route (no `aria-current`, unlike
  `BottomNav.jsx:23` which does this correctly), so if it were ever wired up it would silently
  regress a pattern that's already correct elsewhere;
- its `Bell` and back-button icon buttons have no accessible name (see Finding 3);
- it is not reachable from any route today, so it's dead code that will bit-rot and diverge
  further from `BottomNav.jsx`/`Header.jsx` if either is updated later without touching this file.

**Remediation:** Out of this audit's UI/UX scope to say whether it should be deleted (that's a
code-hygiene call for `code-auditor`/`dep-auditor`), but flagging here because if it is ever wired
back in, it should first be brought up to the `aria-current`/`aria-label` standard the rest of the
nav chrome already meets, rather than shipped as-is.

---

### 6. [LOW] Placeholder/empty-state text likely fails WCAG AA contrast
**Location:** widespread, e.g. `frontend/src/pages/ProductDetailPage.jsx:57` (`<span className="text-gray-400">No image available</span>`), `frontend/src/pages/MarketplacePage.jsx:208`, `frontend/src/pages/CartPage.jsx:99` — pattern recurs in ~30 files (`text-gray-400` on a white/`bg-gray-100`/`bg-gray-200` background)

Tailwind's `gray-400` (`#9CA3AF`) on a white or near-white background is roughly a 2.8:1 contrast
ratio, below the WCAG AA minimum of 4.5:1 for normal-size text (3:1 would be acceptable only for
large/bold text, which these spans are not). This is low-severity because the text in question is
placeholder/empty-state copy ("No image available", "No image") rather than primary content or
interactive labels, but it recurs often enough to be worth a pass.

**Remediation:** Bump these to `text-gray-500`/`text-muted-foreground` (the project's own
`--muted-foreground` token in `frontend/src/index.css:18` is `215.4 16.3% 46.9%`, close to
`gray-500`, which lands closer to 4.6:1 on white) for placeholder/empty-state text.

---

### 7. [INFO / POSITIVE] Accessible-by-default UI primitives and skip link
**Location:** `frontend/src/components/ui/dialog.jsx:37-42` (Radix `Dialog.Close` + `sr-only`
"Close" span), `frontend/src/components/ui/select.jsx`, `tabs.jsx`, `label.jsx` (all Radix-based,
correct roles/keyboard handling for free), `frontend/src/components/Layout.jsx:26-31` (working
skip-to-content link, `id="main-content" tabIndex={-1}` receiver at `Layout.jsx:35`),
`frontend/src/components/Header.jsx` (`aria-current`, `aria-expanded`, `aria-controls`,
`aria-haspopup` used correctly on the mobile menu button and search inputs),
`frontend/src/index.css:162-177` (`prefers-reduced-motion` respected globally; `.a11y-voice`
strengthens the focus ring for screen-reader/voice users).

No action needed — noted so remediation of Findings 1–4 is understood as inconsistency with an
otherwise solid baseline, not a from-scratch accessibility build-out.

---

### 8. [INFO] Two custom accessibility-mode systems doing related but separate things
**Location:** `frontend/src/components/Accessibility/AccessibilityProvider.jsx` (simple/kiosk/
voice/sms modes, toggled via `localStorage` + `<html>` classes) vs. the dark-mode token system in
`frontend/src/index.css:78-122` (`.dark` class) — both are class-driven theming layers applied to
`document.documentElement`, but nothing in the auditable frontend code wires the two together
(e.g. it's unclear whether `.dark` and `.a11y-voice` are expected to compose, or where `.dark` is
toggled from at all — no toggle call site was found in `frontend/src`). This isn't a defect by
itself, just worth flagging for whoever owns the theming story, since two independent
class-on-`<html>` systems are easy to have silently stop composing as new components are added.

## Metrics

| Metric | Count |
|---|---|
| Frontend source files scanned (`.jsx`/`.js`/`.css`) | ~640 (150 near-duplicate stub modules × ~4 files + ~100 pages + ~35 shared components + primitives) |
| `<img>` tags found | 6, all with `alt` attributes present (no missing-alt issues found) |
| `<label>` elements | 230 |
| `<label>` elements with matching `htmlFor`/`id` | 16 (in 6 of 36 files that use `<label>`) |
| Files with icon-only `<button>` + no `aria-label`/text (sampled pattern) | 13 occurrences across 11 files |
| Files using `aria-*` attributes at all | 26 |
| Pages with zero responsive (`sm:`/`md:`/`lg:`) classes | 14 |
| Files using `overflow-x-auto`/`overflow-auto` for wide tables | 23 (plus the shared `Table` primitive wraps every table automatically) |
| Desktop nav dropdowns that are hover-only (no keyboard path) | 8 (`Header.jsx`) |
| Radix-based accessible primitives in use | `Dialog`, `Select`, `Tabs`, `Label`, `Slot` (button `asChild`) |
