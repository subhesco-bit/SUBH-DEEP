---
agent: seo-auditor
status: fail
findings: 10
---

# SEO Audit — AFRERA Frontend

## Scope

Static source inspection only (no live URL/crawl). Audited the deployed frontend
app at `frontend/` (Vite + React 18 SPA, client-side routed via
`react-router-dom`'s `BrowserRouter` — confirmed in `frontend/src/main.jsx:3,23`
and `frontend/src/App.jsx:1,360`). There is no Next.js `_document`/head
component and no SSR/SSG layer of any kind — `frontend/index.html` is the
single HTML shell for all routes.

Two other root-level HTML files exist (`afrera_platform_v43.html`,
`PROJECT_STATUS.html`) but are legacy/reference documents, not part of the
`frontend/` build (no build tooling references them) — excluded from findings
below, noted only where relevant as corroborating context.

## Summary

The app is a pure client-rendered SPA with **one static `<head>` shared by
~150 routes** (marketplace, product detail pages, ~140 module/dashboard
pages). Basic single-page metadata was added recently (description, Open
Graph, Twitter Card, PWA tags — `frontend/index.html:6-31`) and is solid as
far as it goes, but nothing varies per route: every page — including the
product marketplace and individual product pages — serves the identical
title, description, and social-preview metadata. There is no canonical URL,
no structured data (JSON-LD), no `robots.txt`, and no `sitemap.xml`. For a
multi-hundred-route commerce/services platform, this means search engines and
link-preview crawlers cannot meaningfully distinguish one page from another,
and product pages get no rich-result eligibility (no `Product`/`Offer`
schema).

Notably, the legacy reference file `afrera_platform_v43.html:11528-11530`
contains a comment explicitly flagging this exact defect ("every route shared
one `<title>`. Bad for tabs, history, bookmarks...") and a `v401Title()` fix
for it — evidence the team previously solved this problem in an earlier
iteration, but the fix was never carried into the current `frontend/` React
app.

## Findings

### 1. [HIGH] No per-route `<title>`/meta description — single static head for ~150 routes
- **Location:** `frontend/index.html:7,31` (static `<meta name="description">`, `<title>`); `frontend/src/App.jsx:360-1333` (all `<Route>` definitions); no `document.title` or `<Helmet>` usage found anywhere in `frontend/src` (`grep -rl "react-helmet|Helmet|document.title"` returned no matches; `react-helmet(-async)` is not a dependency in `frontend/package.json`).
- **Description:** Every route — `/`, `/marketplace`, `/products/:id`, `/dashboard`, all ~140 module pages — renders with the exact same `<title>AFRERA Platform</title>` and the same generic description ("AFRERA - Empowering Rural India Through Technology"). A shared link to a specific product or module is indistinguishable from the homepage in a browser tab, bookmark, search result, or chat preview.
- **Remediation:** Add `react-helmet-async` (or equivalent) and set a distinct `title`/`meta description` per route, especially `ProductDetailPage.jsx` (product name + price) and `MarketplacePage.jsx` (category/search context). At minimum, wire a `useEffect` that sets `document.title` on route change.

### 2. [HIGH] No canonical URL tags
- **Location:** `frontend/index.html` (no `<link rel="canonical">` present); confirmed absent app-wide (`grep -rn "rel=\"canonical\""` → no matches, excluding `node_modules`).
- **Description:** No canonical tag exists anywhere, static or dynamic. Combined with finding #1, this creates duplicate-content ambiguity for any route reachable via multiple paths — e.g. `/subsidy`, `/subsidypassthrough`, and `/schememonitor` in `frontend/src/App.jsx:1038-1061` all render the same `SubsidyManagementPage` component with no canonical pointing search engines to one preferred URL.
- **Remediation:** Inject a per-route `<link rel="canonical" href="https://<domain>{pathname}">` (via the same head-management library as #1), and canonicalize the three subsidy aliases to a single URL.

### 3. [HIGH] No structured data (JSON-LD) anywhere
- **Location:** App-wide (`grep -rl "application/ld+json|schema.org"` across `frontend/` → no matches).
- **Description:** No `Organization`, `WebSite`, `Product`, `Offer`, or `BreadcrumbList` schema exists. `frontend/src/pages/ProductDetailPage.jsx` and `frontend/src/pages/MarketplacePage.jsx` represent a commerce marketplace with priced listings but carry zero structured data, so listings are ineligible for rich results (price/availability snippets, product rich cards) in search.
- **Remediation:** Add a site-wide `Organization`/`WebSite` JSON-LD block in the head, and per-product `Product`/`Offer` JSON-LD on `ProductDetailPage.jsx` sourced from the same data already rendered in the page.

### 4. [MEDIUM] Missing `robots.txt`
- **Location:** `frontend/public/` (directory listing: `icons/`, `manifest.json`, `manifest.webmanifest`, `sw.js` — no `robots.txt`).
- **Description:** No crawl directives exist. This isn't blocking crawlers today, but it also means there's no mechanism to keep crawlers out of purely account-gated/internal routes (e.g. `/admin-dashboard`, `/modules/m001`–`/modules/m150`) or to point crawlers at a sitemap once one exists.
- **Remediation:** Add `frontend/public/robots.txt` with `Sitemap:` directive and `Disallow` rules for admin/module routes that have no public value being indexed.

### 5. [MEDIUM] Missing `sitemap.xml`
- **Location:** `frontend/public/` (same listing as #4 — absent).
- **Description:** With ~150 routes and no server-rendering, discovery depends entirely on crawlers following in-app links and executing JS. There's no authoritative list of public URLs (e.g. `/`, `/marketplace`, `/products/:id`, `/pricing/forward`, `/climate`, `/farmer-entrance*`) to accelerate indexing.
- **Remediation:** Generate a static or build-time sitemap enumerating the public (non-`ProtectedRoute`) paths from `frontend/src/App.jsx`, reference it from `robots.txt`.

### 6. [MEDIUM] Missing `og:image`, `og:url`, and `twitter:image`
- **Location:** `frontend/index.html:22-29`.
- **Description:** Open Graph/Twitter tags cover `type`, `site_name`, `title`, `description`, `locale`, and `twitter:card`/`title`/`description`, but there is no `og:image`, `og:url`, or `twitter:image`. `twitter:card` is set to `summary_large_image`, which explicitly expects a large image — with none supplied, most platforms will render a broken or blank preview card for any shared link.
- **Remediation:** Add a default `og:image`/`twitter:image` (1200×630 social card) and `og:url` (canonical page URL, tying into finding #2). If per-route images become available later, override per page via the same head-management mechanism as #1.

### 7. [LOW] Broken favicon reference (404)
- **Location:** `frontend/index.html:5` — `<link rel="icon" type="image/svg+xml" href="/vite.svg" />`.
- **Description:** `frontend/public/vite.svg` does not exist (confirmed: no `vite.svg` anywhere under `frontend/`, only Vite's own scaffold default which was never added or was deleted). Every page load requests a favicon that 404s. Search result favicons and browser tabs will show a broken/default icon instead of AFRERA branding, even though correct PNG icons already exist at `frontend/public/icons/icon-192.png` etc. and are correctly wired into the manifest (see recent commit `b08881d5`, which fixed the *manifest* icon references but did not touch this separate `<link rel="icon">` tag).
- **Remediation:** Point `<link rel="icon">` at an existing icon (e.g. `/icons/icon-192.png`) or add a real favicon asset, and add `<link rel="apple-touch-icon" href="/icons/icon-192.png">` for iOS home-screen/search presentation.

### 8. [LOW] Two conflicting, inconsistently-branded manifest files
- **Location:** `frontend/public/manifest.json` (unreferenced) vs. `frontend/public/manifest.webmanifest` (the one actually linked, `frontend/index.html:13`).
- **Description:** `manifest.json` has `"name": "AFRERA Platform"`, `theme_color: "#10b981"`, no `lang`/`dir`; `manifest.webmanifest` has `"name": "AFRERA — Agriculture & Rural Economy Platform"`, `theme_color: "#16a34a"`, `lang: "en"`, `dir: "ltr"`. Both were touched/added around the same PWA work (`manifest.json` rewritten in commit `b08881d5` for its icon list) but never reconciled with the other file or with `index.html`'s own `<meta name="theme-color" content="#16a34a">` (index.html:14, which matches `.webmanifest`, not `.json`). The orphaned `manifest.json` is dead weight that will mislead anyone auditing by the conventional `manifest.json` filename and risks being wired in by mistake with the wrong branding/color.
- **Remediation:** Delete the unreferenced `manifest.json` (or make it the canonical one and repoint `index.html`), so there is a single source of truth for app name/theme color.

### 9. [LOW] 12 page components have no `<h1>`
- **Location:** `frontend/src/pages/BankPassportPage.jsx`, `ClimateWeatherPage.jsx`, `CompetitivePositionPage.jsx`, `CompliancePage.jsx`, `CorridorEconomicsPage.jsx`, `ExperienceLayerPage.jsx`, `ForwardPricingPage.jsx`, `LandUseCarbonPage.jsx`, `LedgerPage.jsx`, `RfqPage.jsx`, `WalletPage.jsx`, `YieldManagementPage.jsx`.
- **Description:** 12 of 68 top-level page components (`frontend/src/pages/*.jsx`) contain no `<h1>` element at all — likely relying on a generic layout heading or none, which weakens on-page topical signal for each of these routes and page-level heading hierarchy (WCAG 2.4.6 territory too, but flagged here for its SEO/on-page relevance). No files were found with multiple competing `<h1>`s.
- **Remediation:** Give each page a single, descriptive `<h1>` matching its content (e.g. "Bank Passport", "Compliance", "Forward Pricing").

### 10. [PASS] Baseline tags present and correct
- **Location:** `frontend/index.html:2,6-18`.
- `<html lang="en">` is set (index.html:2).
- Viewport meta is present and correctly configured (index.html:6).
- A document-level `meta description` exists (index.html:7), just not per-route (see #1).
- Core Open Graph (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:locale`) and Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`) tags are present and populated with real, on-brand copy (index.html:22-29), not boilerplate/placeholder text.
- PWA/manifest icon references were recently fixed to match real on-disk files (commit `b08881d5`) — `manifest.webmanifest`'s icon array (192/512/maskable-512) matches `frontend/public/icons/` exactly.

## Metrics

| Metric | Value |
|---|---|
| Routes defined in `App.jsx` | ~150 (`<Route>` elements, `frontend/src/App.jsx:360-1333`) |
| Distinct `<title>`/meta-description states across all routes | 1 |
| Pages with per-route head management (Helmet/document.title) | 0 |
| `<link rel="canonical">` tags found | 0 |
| JSON-LD / `schema.org` blocks found | 0 |
| `robots.txt` present | No |
| `sitemap.xml` present | No |
| OG tags present / expected core set | 5 / 7 (missing `og:image`, `og:url`) |
| Twitter Card tags present / expected core set | 3 / 4 (missing `twitter:image`) |
| Page components (`src/pages/*.jsx`) | 68 |
| Page components with an `<h1>` | 56 / 68 |
| Page components with 0 `<h1>` | 12 / 68 |
| Page components with multiple `<h1>` | 0 / 68 |
| Manifest files present | 2 (1 referenced, 1 orphaned/conflicting) |
| Favicon link resolves to an existing file | No (`/vite.svg` missing) |
