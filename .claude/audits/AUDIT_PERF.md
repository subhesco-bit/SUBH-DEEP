---
agent: perf-auditor
status: fail
findings: 8
---

# Performance Audit — AFRERA Platform

## Summary

The frontend (Vite + React 18 SPA) has a well-configured `manualChunks` split for
vendor/ui/forms/charts libraries, but that configuration is almost entirely
neutralized by a single root cause: **zero route-level code splitting**.
`frontend/src/App.jsx` statically imports well over 200 page/module components
(150 auto-generated `M0xx` modules plus ~100 hand-built pages), and
`frontend/src/main.jsx` mounts them all inside one `<BrowserRouter>` with no
`React.lazy`/`Suspense` anywhere in the codebase. Every visitor — including an
anonymous user hitting `/` — downloads and parses the JS for all ~570 `.jsx`
files (2.3 MB of source, 27k+ lines) before the app becomes interactive.

On the backend, Express is reasonably instrumented (compression, helmet, a
Redis caching module, a job queue via `bull`), but the caching layer is wired
up and then essentially unused across the 109 service files, there are two
independent, competing real-time layers (`socket.io` in `src/index.js` and a
hand-rolled `ws`-based `SocketServer` that is never initialized, so three
services silently no-op their real-time notifications), and one service
(`formService.js`) performs synchronous, blocking file I/O
(`fs.readFileSync`/`fs.writeFileSync` on a growing JSON file) on nearly every
request to its endpoints, which stalls the entire Node.js event loop for all
concurrent users.

No wholesale `lodash`/`moment` imports were found, image assets in
`frontend/public` are small (under 3 KB each), and the two components that do
poll on an interval (`RealTimeTracking.jsx`, `DeviceMonitor.jsx`) clean up
correctly on unmount.

## Findings

### 1. [CRITICAL] Zero route-level code splitting — entire app ships as one bundle
**Location:** `frontend/src/App.jsx:1–330` (import block), `frontend/src/main.jsx:1–38`

Every route component is imported statically at the top of `App.jsx` — roughly
100 hand-written pages (`HomePage`, `MarketplacePage`, `DashboardPage`, etc.)
plus all 150 `M001Page`…`M150Page` auto-generated module pages
(`frontend/src/modules/M001/M001Page.jsx` … `M150/M150Page.jsx`). None of
these use `React.lazy(() => import(...))`, and there is no `<Suspense>`
boundary anywhere in `src` (confirmed via search — zero matches for
`React.lazy`, `lazy(`, or `Suspense` in `frontend/src`). Because every import
is static, Rollup/Vite cannot split per-route chunks, so the `vite.config.js`
`build.rollupOptions.output.manualChunks` split (`vendor`, `ui`, `forms`,
`charts`) only pulls third-party libraries out of the app code — the ~570
first-party component files (2.3 MB source, 27,208 lines in `.jsx` files
alone) all land in one `index-*.js` chunk that every visitor downloads on
first paint, regardless of which single route (often just `/` or `/login`)
they actually need.

**Remediation:** Convert every `<Route element={<XPage />} />` in `App.jsx` to
`React.lazy` + a single top-level `<Suspense fallback={...}>` wrapper around
`<Routes>`. Given the uniform `modules/M0NN/M0NNPage.jsx` naming, the 150
auto-generated module routes are a mechanical find/replace:
```js
const M001Page = lazy(() => import('./modules/M001/M001Page'))
```
This alone should cut the initial JS payload by an order of magnitude for any
single-route visit. Prioritize splitting out the 150 `/modules/m0NN` admin
routes first (they are already behind `requiredRole="admin"` and are the bulk
of the import list), then the less-common protected pages.

### 2. [HIGH] `chunkSizeWarningLimit` raised to mask the bundle-size symptom
**Location:** `frontend/vite.config.js:29`

```js
chunkSizeWarningLimit: 1000,
```
Vite's default warning threshold (500 KB) was raised to 1000 KB rather than
addressed. Given finding #1, this strongly suggests the single main chunk
already exceeds the default limit and the threshold was raised to silence the
build warning instead of splitting the bundle.

**Remediation:** Revert to default (or lower) once route-level lazy-loading
(#1) is in place, so the warning again functions as a regression guard against
future un-split heavy imports.

### 3. [HIGH] Redis caching layer exists but is applied to ~0 of 109 backend services
**Location:** `backend/src/cache/redis.js` (full module: `get`/`set`/`del`/`cache()` decorator/`invalidateEntity`), usage check across `backend/src/services/*.js`

`backend/src/cache/redis.js` is a complete, well-built cache abstraction
(get/set/TTL/pattern-delete/decorator) initialized at process start
(`backend/src/cache/redis.js:247-251`). Searching all 109 files in
`backend/src/services` for `require('../cache/redis')` returns zero matches —
the only file in `backend/src` that requires the module is `src/index.js`
itself. None of the obviously cacheable read-heavy paths (product/marketplace
listings, analytics aggregation queries in
`backend/src/services/analyticsService.js`, AI prediction results in
`backend/src/services/aiService.js`, price/board data) go through it. Every
request re-runs the full DB query.

**Remediation:** Wire the existing `cache.get/set` (or the `cache()`
decorator already written in `redis.js:192-219`) into the highest-traffic
read endpoints first — marketplace product listing/search and analytics
dashboards are the obvious candidates given their query cost. The
infrastructure is already there; it just isn't called anywhere.

### 4. [HIGH] Synchronous, blocking file I/O on the request path in formService
**Location:** `backend/src/services/formService.js:28-55`, called from handlers at lines 182, 185, 224, 253, 271, 306, 324

```js
function readStore() {
  ...
  const raw = fs.readFileSync(STORE_PATH, 'utf8');   // line 35
  const parsed = JSON.parse(raw);
  ...
}
function writeStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2)); // line 49
  ...
}
```
`readStore()`/`writeStore()` back a JSON-file fallback store
(`form_store.json`) used by the form-management route handlers whenever the
PostgreSQL path isn't available or as the primary path (7 call sites in this
file). `fs.readFileSync`/`fs.writeFileSync` are fully synchronous — they block
Node's single event loop thread for the duration of the read/parse or
stringify/write, meaning **every other in-flight request on the server stalls**
while one form request is served. This gets worse as `forms`/`submissions`
arrays grow, since each call re-reads and re-serializes the entire file rather
than appending.

**Remediation:** Replace with `fs.promises.readFile`/`writeFile` (async), and
longer-term move this off the filesystem entirely onto the PostgreSQL path
that already exists in the same file (`loadFormsFromDb`, `ensureDatabaseSchema`
at lines 57-90) so the JSON-file fallback isn't a routine hot path.

### 5. [MEDIUM] Two competing real-time layers; one is dead code and silently swallows notifications
**Location:** `backend/src/index.js:309-314, 685-707` (socket.io); `backend/src/websocket/socketServer.js` (full file, `ws`-based); `backend/src/websocket/index.js:12` (`socketServer.initialize(server)` — never called from `index.js`)

`backend/src/index.js` sets up its own `socket.io` `Server` instance
(`index.js:309`) with `io.on('connection', ...)` handling `join`,
`subscribe:orders`, `subscribe:shipment`. Separately,
`backend/src/websocket/socketServer.js` implements a full second real-time
system on raw `ws` (`WebSocket.Server`, rooms, `sendNotification`,
`sendGovernmentAnnouncement`, `sendTrackingUpdate`, etc.), exposed via
`backend/src/websocket/index.js`, whose `initialize(server)` function is never
invoked anywhere in `backend/src/index.js` (confirmed by grep: `websocket`
does not appear in `index.js` outside the unrelated `socket.io` setup). Yet
three services call into the uninitialized instance:
`governmentSchemeService.js:501`, `insuranceClaimsService.js:75,149`, and
`preSeasonOrderService.js:135,195,571` all call
`socketServer.sendNotification(...)` / `sendGovernmentAnnouncement(...)`.
Because `this.wss` is never set and `this.clients` stays empty, these calls
return `false` silently (see `sendToUser` at `socketServer.js:189-196`) —
government announcements, insurance-claim notifications, and pre-season order
updates never reach any client, and no error is logged.

This is functionally a correctness bug (notifications are dropped), but it's
flagged here because it's also dead-weight infrastructure: an entire
unused server class, connection map, and room map sitting in the runtime with
no consumer, plus per-service code paths computing/serializing payloads for a
socket layer that never sends them.

**Remediation:** Pick one real-time transport. Either call
`require('./websocket').initialize(httpServer)` in `index.js` and route those
three services through it, or (simpler, since `socket.io` is already live)
rewrite the three call sites to use the existing `io` instance/rooms instead
of the dead `ws` server, and delete `backend/src/websocket/socketServer.js`.

### 6. [MEDIUM] Minor render-thrash risk: near-zero use of memoization across 565 components
**Location:** frontend-wide — `React.memo`/`useMemo`/`useCallback` appear in only 5 of 565 `.jsx` files under `frontend/src`

Most page/module components are simple enough that this isn't a problem on
its own, but combined with finding #1 (everything mounted in one large route
tree) and typical list-heavy pages (marketplace listings, dashboards with
`.map()`-rendered cards), the near-total absence of memoization means any
parent state change (e.g. a debounced search input, as in
`frontend/src/pages/MarketplacePage.jsx:38-53`) can trigger re-renders of
large child trees with no `React.memo` boundary to stop propagation.

**Remediation:** Not urgent in isolation — reassess after #1 is fixed and
profile actual render cost with React DevTools Profiler on the
highest-traffic pages (Marketplace, Dashboard) before spending effort on
blanket memoization.

### 7. [LOW] `setTimeout` fired without cleanup in two components (unmount race → no-op setState warning, minor leak while pending)
**Location:** `frontend/src/pages/FarmAdvisorPage.jsx:41` (inside the message-send handler); `frontend/src/components/VoiceAI/VoiceAssistant.jsx:114` (inside `processVoiceCommand`)

Both schedule a `setTimeout` that later calls `setState` (`setMessages`/
`setResponse` etc.) but do not store the timer id or clear it on unmount. If
the user navigates away while the timeout is pending, the callback still
fires and calls `setState` on an unmounted component — harmless in terms of
memory (the timer/component get garbage-collected once the callback runs) but
it is wasted work and, pre-React 18 behavior aside, a code smell that the two
components with recurring polling in the same directories
(`RealTimeTracking.jsx:26-28`, `DeviceMonitor.jsx:33-35`) already avoid
correctly with `clearInterval` in their `useEffect` cleanup.

**Remediation:** Store the timeout id in a ref and clear it in a `useEffect`
cleanup function, matching the pattern already used for the interval-based
components in this codebase.

### 8. [LOW] Service worker registered without update/error UX, and PWA asset caching not verified
**Location:** `frontend/src/App.jsx:337-346`

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => { console.log('Service Worker registered:', registration) })
    .catch((error) => { console.error('Service Worker registration failed:', error) })
}
```
This runs on every mount of `App` (inside a `useEffect` with `[checkAuth]` as
its dependency, so effectively once, but re-registers the SW object each
time `checkAuth` reference changes). Not a bug, but registration success/
failure is only logged to console — there's no user-facing update prompt for
new service-worker versions or explicit unregister-on-error path, which is
worth a follow-up once caching strategy inside `sw.js` itself is audited
(out of scope here — `sw.js` was not located/read as part of this pass; if it
precaches a large asset list, that's an additional bundle-weight vector worth
checking separately).

**Remediation:** Low priority; note for future audit — verify `public/sw.js`
precache list doesn't grow in lockstep with the bundle described in #1.

## Metrics

| Metric | Value |
|---|---|
| Frontend `src` total size | 2.3 MB (`du -sh frontend/src`) |
| Total `.jsx` line count | 27,208 lines |
| Total component files (`.jsx`) | 565 |
| Statically-imported route components in `App.jsx` | ~250+ (100 hand-built pages + 150 `M0NN` modules) |
| `React.lazy`/`Suspense` usages found | 0 |
| `React.memo`/`useMemo`/`useCallback` usages | 5 files (of 565) |
| `vite.config.js` `chunkSizeWarningLimit` | 1000 KB (raised from Vite default of 500 KB) |
| Manual vendor chunks configured | 4 (`vendor`, `ui`, `forms`, `charts`) — app code not split |
| Backend service files | 109 (`backend/src/services`) |
| Backend services actually using `cache/redis.js` | 0 of 109 (only `src/index.js` requires it) |
| Synchronous `fs.readFileSync`/`writeFileSync` call sites on request path | `formService.js` (2 functions, 7 call sites) |
| Independent real-time (WebSocket) implementations | 2 (`socket.io` in `index.js`, active; `ws`-based `SocketServer`, dead/uninitialized) |
| Static asset sizes (`frontend/public/icons`) | 769 B – 2.4 KB each — not a concern |
| `lodash`/`moment` wholesale imports found | 0 (false positives only — comment text matches) |
