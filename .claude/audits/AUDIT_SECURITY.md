---
agent: security-auditor
status: fail
findings: 9
---

# Security Audit

## Summary

Static analysis of the `backend/` (Express + PostgreSQL/MongoDB) and `frontend/` trees. The
codebase generally uses parameterized queries correctly (no direct SQL injection was found —
every dynamic-SQL site either binds values via `$N` placeholders or validates identifiers with
a strict regex before interpolation), CORS is scoped to a single configured origin, and rate
limiting is applied globally. However, there is one **critical** authentication-bypass issue,
one **high** severity issue (unauthenticated CRUD on health/PII records with no ownership
check), and several medium/low gaps around defense-in-depth input validation and dead security
middleware that give a false sense of coverage.

No hardcoded secrets, committed `.env` files, private keys, or cloud credentials were found in
the repository (only `backend/.env.example`, which contains placeholders). No `dangerouslySetInnerHTML`
/ `innerHTML` usage was found in `frontend/src`. No `console.log` of passwords/tokens/secrets was found.

## Findings

### CRITICAL — Authentication bypass via `SKIP_AUTH` environment variable
**Location:** `backend/src/middleware/auth.js:14-23`

```js
if (process.env.SKIP_AUTH === 'true') {
  req.user = { id: process.env.TEST_USER_ID || 'test-user', ... role: 'consumer', permissions: [] };
  return next();
}
```
`authMiddleware` — the function protecting every route that requires `authMiddleware` — checks
`process.env.SKIP_AUTH` **before** checking `NODE_ENV`. If this variable is ever set to `'true'`
in a staging or production environment (misconfigured deploy, copy-pasted `.env`, CI secret
leak into runtime env, etc.), every protected endpoint in the app becomes accessible with no
token, silently granting a default identity. There is no additional guard such as
`NODE_ENV !== 'production'` wrapping this branch, and the variable is not even listed/warned
about in `backend/.env.example`, so an operator has no documented signal that it exists or is
dangerous.

**Remediation:** Gate this branch on `NODE_ENV !== 'production'` as well (fail closed if
`SKIP_AUTH=true` is set while `NODE_ENV=production`, e.g. throw at startup), and document the
flag prominently in `.env.example` as dev/test-only.

---

### HIGH — Fallback JWT secret is a hardcoded, publicly-known string
**Location:** `backend/src/services/authService.js:28`, reused at `authService.js:133`, and
`backend/src/middleware/security.js:9,48,56` (`ENCRYPTION_KEY`/`JWT_SECRET` fallbacks are the
same pattern)

```js
secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
```
If `JWT_SECRET` is unset at runtime, the service silently signs and verifies tokens with a
hardcoded literal that is visible in the source (and in this report). Anyone who reads the repo
can forge arbitrary valid access/refresh tokens (`generateAccessToken`/`generateRefreshToken`,
`authService.js:95-126`) for any `userId`/`role`, including `admin`/`superadmin`, and pass
`requireRole`/`adminMiddleware` checks. `.env.example` does correctly flag this as
"REQUIRED IN PRODUCTION" with a generation command, so the risk is documented, but the code
itself has no runtime enforcement — a missing env var degrades to an insecure default instead
of a fail-fast error.

**Remediation:** Remove the string fallback; at process startup, `throw` if
`process.env.JWT_SECRET` (and `ENCRYPTION_KEY`) is unset when `NODE_ENV === 'production'`, so a
misconfiguration is a boot failure, not a silent vulnerability. Also pin
`jwt.verify(...)` to `algorithms: ['HS256']` explicitly (currently no `algorithms` option is
passed in `verifyToken`, `authService.js:131-151`) to remove any ambiguity about acceptable
signing algorithms.

---

### HIGH — Farmer health records: full CRUD with zero authentication and no ownership check (IDOR)
**Location:** `backend/src/routes/farmerHealthRoutes.js:1-104`, mounted unauthenticated at
`app.use('/api/v1/farmer-health', farmerHealthRoutes)` (`backend/src/index.js:603`)

None of the 8 routes in this file reference `authMiddleware`, `requireRole`, or any auth check
— confirmed by grep across `backend/src/routes` (this file is one of only 4 route files with
zero auth-related references, see Metrics). Endpoints include:

- `POST /health-records` — create a health record for any `farmerId` supplied in the body
- `GET /health-records/:id`, `PUT /health-records/:id`, `DELETE /health-records/:id` — read,
  modify, and delete any health record by sequential integer ID, no ownership check
- `GET /farmers/:farmerId/health-summary` — read any farmer's health summary
- `GET /welfare-programs`, `POST /welfare-enrollments` — enroll any `farmerId` in any
  `programId`, both taken directly from `req.body` with no verification the caller is that
  farmer or an admin

This exposes what is effectively PHI/PII (health records, welfare eligibility) to any
unauthenticated caller who can reach the API, and allows unauthenticated deletion/modification
of that data. This is both a missing-auth and an IDOR (`:id`/`farmerId` trusted with no
ownership/role check) issue simultaneously.

**Remediation:** Add `authMiddleware` (and likely `requireRole('admin', ...)` for welfare
enrollment/record mutation) to every route in this file, and enforce that the record's
`farmerId` matches the resolved authenticated farmer (via the existing
`middleware/resolveFarmerId.js` pattern already used correctly elsewhere, e.g.
`farmerPortalEnhancements.js:186` for wallet routes) unless the caller is staff.

---

### MEDIUM — `food` and `energy` route files have no authentication on any endpoint
**Location:** `backend/src/routes/foodRoutes.js` (all 7 routes), `backend/src/routes/energyRoutes.js`
(all 6 routes); mounted at `backend/src/index.js:583-604`

Both files have zero references to `authMiddleware`/`requireRole`/`adminMiddleware`. Most
endpoints are stateless calculators (shelf-life prediction, tariff lookup) which is plausibly
intentional, but several write/record endpoints have no auth and accept fully attacker-controlled
identifiers with no validation of caller identity:
- `foodRoutes.js:95` `POST /traceability/record-movement` — anyone can write a traceability
  checkpoint (`operator`, `blockchain_hash`, etc.) for any `batch_id`, polluting a supply-chain
  audit trail that is presumably meant to be trustworthy.
- `foodRoutes.js:177` `POST /safety/compliance-check`, `foodRoutes.js:257`
  `POST /certification/organic-recommend` — free-form batch/farm IDs, no auth.

Unlike `farmerHealthRoutes.js` this is not clearly PII, so severity is medium rather than high,
but an unauthenticated write to a traceability/compliance record undermines the integrity
guarantees those features exist to provide.

**Remediation:** Confirm with product intent which of these are meant to be public reads vs.
authenticated writes (compare to `demandRoutes.js:1-4`, which explicitly documents "reads are
public; nothing here writes" — the missing equivalent comment/enforcement here looks like an
oversight rather than a decision). Add `authMiddleware` to all `POST` routes at minimum.

---

### MEDIUM — IDOR: any authenticated user can read any party's financial risk profile
**Location:** `backend/src/routes/recoveredFinanceRoutes.js:119-121`

```js
router.get('/risk/:partyId', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await fin.partyRisk(req.params.partyId) }); } catch (e) { fail(res, e); }
});
```
`authMiddleware` only confirms the caller has *a* valid token — it does not check that
`req.user` is the `partyId` in question, staff, or otherwise entitled to view that party's risk
data. Any authenticated user (role `consumer` included) can enumerate `partyId` values and pull
another party's financial risk profile. Contrast with `enwr/my-receipts` in the same file
(`recoveredFinanceRoutes.js:78-82`), which correctly uses `resolveFarmerId` to scope the query
to the caller.

**Remediation:** Either scope this to the caller's own resolved party ID, or restrict it with
`requireRole('admin', 'lender', ...)` if it is meant to be a staff/partner-facing lookup.

---

### MEDIUM — No schema-based input validation is wired up anywhere
**Location:** repo-wide; `joi` is a declared dependency (`backend/package.json`) and
`validateBody` is exported from `backend/src/index.js` area but a grep for `validateBody` usage
across `backend/src/routes/**` returns **zero** matches.

Route handlers validate input ad hoc with manual `if (!field) return res.status(400)` checks
(seen throughout `foodRoutes.js`, `energyRoutes.js`, `farmerHealthRoutes.js`, etc.), with no
type/shape/length enforcement beyond presence checks. Fields such as `quantity_kg`,
`storage_temperature`, `crop_history` (arrays), `environmental_conditions` (objects) are passed
through to service/business logic with no bounds or type checking, relying entirely on
downstream code to not misbehave on malformed input (wrong type, oversized array, negative
numbers, etc.).

**Remediation:** Apply `joi` schemas (the dependency is already present) via the existing but
unused `validateBody` middleware on at least the write-path routes identified above.

---

### LOW — Security middleware module (`middleware/security.js`) is fully dead code
**Location:** `backend/src/middleware/security.js` (298 lines); confirmed via grep that
`securityMiddleware`, `csrfProtection`, `preventSQLInjection`, `preventXSS`, `sanitizeInput`,
and this file's own `rateLimiter`/`strictRateLimiter`/`securityHeaders` are **never imported**
in `backend/src/index.js` or anywhere else in `backend/src/routes` or `backend/src/services`.
`index.js` instead uses `helmet` directly and `middleware/rateLimiter.js` (a different,
`rate-limiter-flexible`-based implementation) for its actual protections.

This is a maintenance/false-confidence risk more than a direct vulnerability: a developer
grepping for "XSS prevention" or "CSRF protection" will find this file and reasonably assume
those protections are active in the request pipeline, when they are not. The regex-based
`preventSQLInjection`/`preventXSS` implementations here are also weak in general (blocklist-style
pattern matching is easy to bypass and prone to false positives) and should not be relied on
as the primary defense even if wired up — parameterized queries (already used correctly
elsewhere) and output encoding are the correct primary controls.

**Remediation:** Either wire in the pieces that are actually wanted (CSRF protection is
arguably unnecessary here since auth is Bearer-token based, not cookie-session based — verify
no cookie-based session auth path exists before deciding) or delete the dead module to avoid
misleading future readers.

---

### LOW — `NODE_ENV === 'test'` relaxes JWT audience/issuer verification and CORS/auth behavior is env-driven throughout
**Location:** `backend/src/services/authService.js:134-137`, `backend/src/middleware/auth.js:26-49`

In test mode, `verifyToken` skips `issuer`/`audience` checks, and `authMiddleware` takes a
separate code path that still requires a bearer token but performs "relaxed verification."
This is reasonable for a test suite in isolation, but combined with the `SKIP_AUTH` finding
above, the auth middleware now has **three** distinct behavioral modes selected purely by
environment variables (`SKIP_AUTH=true`, `NODE_ENV=test`, default), each with different
guarantees. This branching increases the chance that a production deploy accidentally inherits
test/dev configuration. No exploit is claimed here beyond amplifying the `SKIP_AUTH` and
JWT-secret-fallback findings above; flagged for defense-in-depth.

**Remediation:** Consolidate to a single verification path in non-dev environments; assert at
boot that `NODE_ENV === 'production'` implies `SKIP_AUTH` is unset and `JWT_SECRET`/`ENCRYPTION_KEY`
are set, refusing to start otherwise.

---

### LOW — IDOR-adjacent: farmer "directory" endpoints allow any authenticated user (any role) to view any farmer's FDI score and certifications
**Location:** `backend/src/routes/farmerRoutes.js:63-99`

`GET /:farmerId`, `POST /:farmerId/fdi`, and `GET /:farmerId/certifications` require only
`authMiddleware` (any logged-in user, any role, e.g. `consumer`) with no ownership or role
check on `farmerId`. This may be intentional given the file is explicitly a "Farmer Directory"
(the header comment implies farmer profiles are meant to be broadly viewable, e.g. by buyers),
but it is called out because it is inconsistent with the pattern used elsewhere in the same
codebase (`resolveFarmerId` + explicit scoping in `farmerPortalEnhancements.js` and the
`enwr/my-receipts` example above) and was not obviously a deliberate product decision the way
`demandRoutes.js` documents its public-read intent in a comment.

**Remediation:** If directory visibility is intentional, add a one-line comment stating so (as
`demandRoutes.js` does) so it isn't re-flagged as a regression later. If not intentional,
restrict `/fdi` (computation, potentially expensive) and `/certifications` to the owning
farmer or `requireRole('admin', 'buyer', ...)` as appropriate.

---

### INFORMATIONAL — Dependency versions look current but were not verified against a live CVE feed
**Location:** `backend/package.json`

Key security-relevant packages: `express ^4.18.2`, `jsonwebtoken ^9.0.2`, `bcryptjs ^2.4.3`,
`helmet ^7.0.0`, `pg ^8.11.3`, `mongodb ^6.3.0`, `axios ^1.6.2`, `joi ^17.11.0`. None of these
are pinned to versions with well-known, still-unpatched CVEs as of this static review, but this
agent has no network access to run `npm audit` / check the live advisory database, so this is
not a substitute for running `npm audit` (or an SCA tool) in CI. Flagged for the dep-auditor /
CI pipeline to cover with a live check.

## Metrics

- Route files scanned: 39 (`backend/src/routes/*.js`)
- Route files with **zero** auth-related references (`authMiddleware`/`requireRole`/
  `requirePermission`/`adminMiddleware`): 4 — `demandRoutes.js` (documented public-read, OK),
  `energyRoutes.js`, `farmerHealthRoutes.js`, `foodRoutes.js`
- Dynamic-SQL call sites reviewed for injection (template-literal SQL with `${}`): 6 files
  (`outcomeResolver.js`, `enterpriseControlService.js`, `civilDisruptionService.js`,
  `v42IntelligenceService.js`, `returnLoadBoardService.js`, `regionalVarietyService.js`) — all
  bind user-controlled values via `$N` parameters; the two files that interpolate
  identifiers/table names (`outcomeResolver.js`, `withTransaction.js`) validate them against a
  strict `^[a-z_][a-z0-9_]*$` regex or a fixed allowlist first. **No SQL injection found.**
- Hardcoded secret patterns (AWS keys, Stripe live keys, Google API keys, PEM private keys)
  searched repo-wide: 0 matches
- Committed `.env`/`.pem`/`.key`/credential files (via `git ls-files`): 0 (only
  `backend/.env.example`, template only)
- `dangerouslySetInnerHTML` / `innerHTML` in `frontend/src`: 0 matches
- `console.log` of password/token/secret in `backend/src`: 0 matches (matches found were all
  test fixtures using literal test passwords, e.g. `Test@123`, not real credential logging)
- CORS: single-origin (`process.env.FRONTEND_URL`, default `localhost:3000`), `credentials: true`
  — not wildcarded, acceptable
- Global rate limiting: active (`middleware/rateLimiter.js` mounted at `app.use('/api/', rateLimiter)`,
  `index.js:345`); auth-specific stricter limiter (`authRateLimit`) exists and is used on
  sensitive wallet endpoints in `farmerPortalEnhancements.js`
- `joi` schema validation usage in routes: 0 matches (dependency present, unused)
