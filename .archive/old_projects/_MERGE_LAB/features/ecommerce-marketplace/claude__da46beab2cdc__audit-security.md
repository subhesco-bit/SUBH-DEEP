---
agent: security-auditor
status: fail
findings: 8
---

# Production-readiness security audit

## Summary

The repository is not production-ready. The highest-priority blockers are a tracked production environment file containing credential-shaped values, an unconditional import of a missing backend module that prevents startup, and unauthenticated AI-agent endpoints that expose arbitrary outbound HTTP and JavaScript `eval`. Docker/Compose defaults also permit insecure deployments, while CI explicitly allows tests, security scans, and infrastructure plans to fail.

## Findings

### 1. [CRITICAL] Tracked `.env.production` contains production credentials

**Location:** `.env.production` (tracked by Git; keys include `JWT_SECRET`, Twilio credentials, and `OPENAI_API_KEY`).

**Description:** The file is committed and contains non-placeholder values for authentication and third-party credentials. Anyone with repository/history access can use them; rotation is required even if they were intended for staging. Keeping a deployable secret file in source control also makes accidental leakage through artifacts and forks likely.

**Remediation:** Immediately revoke/rotate every credential in the file, remove it from the entire Git history, add an explicit ignore rule, and inject secrets through the deployment secret manager. Add a CI secret-scanning gate (for example, push protection plus a non-advisory scanner).

### 2. [CRITICAL] Backend cannot start because `websocketService` is missing

**Location:** `backend/src/index.js:513` (`require('./services/websocketService')`); no matching file exists under `backend/src/services`.

**Description:** Node resolves all top-level imports before `startServer()` runs, so `node src/index.js` exits with `MODULE_NOT_FOUND`. This affects both `backend/Dockerfile` (`CMD ["node","src/index.js"]`) and the root image (`CMD ["node","backend/src/index.js"]`), making the declared health checks unreachable.

**Remediation:** Restore the intended service at the exact path or remove/replace the stale import and initialization with the existing WebSocket implementation. Add a CI smoke test that executes `node -e "require('./src/index.js')"` from `backend` (with dependency installation) and fails on module-resolution errors.

### 3. [HIGH] Unauthenticated AI-agent router permits arbitrary outbound requests and code execution

**Location:** `backend/src/index.js:1021` mounts `/api/v1/ai-agent` without auth; `backend/src/routes/aiAgentRoutes.js:20-41,47-68,124-229` exposes task execution, agent/tool registration and mutation; `backend/src/services/aiAgentService.js:94-132` implements `call_api` and `eval(params.expression)`.

**Description:** The router has no `authMiddleware` or role gate. An unauthenticated caller can invoke agent tasks, register/modify agents and tools, and reach the built-in `call_api` tool (SSRF against internal services). The calculator tool evaluates attacker-controlled JavaScript in the server process. Error responses also return raw exception messages.

**Remediation:** Put authentication and an admin/allowlisted capability policy on the router, and enforce authorization again in the service. Remove `eval`; use a strict arithmetic parser/library with bounded input. Remove or tightly allowlist outbound destinations, methods, redirects, response size and timeouts for any HTTP tool. Return generic errors and rate-limit these endpoints.

### 4. [HIGH] Health diagnostics are public and disclose internals; manual checks are an unauthenticated DoS surface

**Location:** `backend/src/index.js:1049-1050`; `backend/src/routes/healthRoutes.js:294-340,346-375,393-450`.

**Description:** `/health/detailed` discloses environment, Node version, platform, architecture, hostname, pool counts and dependency error text. `/health/checks/:name` is a public POST that can repeatedly trigger database/custom checks. Only `/health/ready` should perform dependency probes; detailed diagnostics must not be internet-facing.

**Remediation:** Keep a minimal unauthenticated `/health/live`; restrict `/health/detailed` and `/health/checks*` to an internal network or authenticated operator role. Redact hostnames, dependency errors and pool internals. Add explicit timeouts/caching and rate limits.

### 5. [HIGH] Production Compose has insecure secret fallbacks and exposes stateful services

**Location:** `docker-compose.yml:11,50-55,63-76`.

**Description:** `DB_PASSWORD` and `JWT_SECRET` default to `changeme`, so `docker compose up` can launch a production-labelled stack with forgeable JWTs and known database credentials. PostgreSQL and Redis are published on all host interfaces (`5432`, `6379`), and Redis has no password/TLS. This is a direct hardening bypass, not merely documentation debt.

**Remediation:** Remove all secret defaults and fail configuration validation when values are absent or weak. Do not publish database/cache ports; use the private Compose network. Require Redis authentication/TLS where applicable and use an external secret store.

### 6. [HIGH] Root Docker image is not buildable from this repository

**Location:** root `Dockerfile:10-19,24-26`; root `docker-compose.yml:44-46,82-85`.

**Description:** The root image runs `COPY package*.json ./` and `npm ci`, but the repository has no root `package.json`. Compose also mounts `nginx.conf` and `frontend/dist`, neither of which exists at the checked-out root. Consequently the documented production stack cannot build/start as written.

**Remediation:** Use `backend/` as the image build context with `backend/Dockerfile`, or add a deliberate root workspace manifest and verify all referenced files. Add `docker compose config` and a clean `docker build` smoke test to CI.

### 7. [MEDIUM] CI permits known failures and does not gate production security

**Location:** `.github/workflows/ci.yml:213-215,225-238,316-322,471-474`; `.github/workflows/ci.yml:347-367`.

**Description:** Backend tests, governance/boundary checks, Terraform plan and both `npm audit` jobs use `continue-on-error`; dependency auditing is explicitly advisory. The Docker job only builds locally and never publishes or deploys an immutable, scanned image. A green workflow therefore does not establish that tests, infrastructure, vulnerabilities or the release artifact are acceptable.

**Remediation:** Remove `continue-on-error` for release gates (or isolate explicitly non-production advisory jobs). Make high/critical dependency and container findings fail the protected branch. Publish only after tests/scans pass, tag by commit digest, and deploy that immutable digest with a post-deploy readiness smoke test.

### 8. [MEDIUM] Sensitive integration API keys are only Base64-obfuscated

**Location:** `backend/src/services/enterpriseIntegrationService.js:745-759`.

**Description:** `encryptApiKey`/`decryptApiKey` use Base64, which provides no confidentiality. A database reader or backup consumer can immediately recover stored third-party API keys. The source comment acknowledges this is not production encryption.

**Remediation:** Replace with authenticated encryption (AES-256-GCM or a cloud KMS/envelope-encryption API), keep keys outside the database, support key rotation, and redact decrypted values from logs/responses. Migrate existing rows before enabling integrations in production.

## Metrics

| Metric | Result |
|---|---:|
| Findings | 8 |
| Critical | 2 |
| High | 4 |
| Medium | 2 |
| Tracked production env files | 1 |
| Missing startup import confirmed | 1 |
| Unauthenticated high-risk AI router | 1 |
| CI checks explicitly non-blocking | 10+ |
| Files modified by this audit | 1 report only |
