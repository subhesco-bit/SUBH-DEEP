---
agent: infra-auditor
status: warn
findings: 11
---

# Infra Audit — Docker, CI/CD, Config Drift

## Summary

Scope covered: `backend/Dockerfile`, `backend/docker-compose.yml`, `.github/workflows/ci.yml`, `backend/.github/workflows/ci-cd.yml`, `afrera/.github/workflows`, `infra/terraform/*`, `infra/k8s/*`, `.devin/environment.yaml`, `.node-version`/`.nvmrc`, `tauri.conf.json`.

The commit history claim ("Fix PWA manifest icon mismatch, invalid duplicate CI workflow, add Tauri desktop CI job") **checks out** for the CI-workflow part: `.github/workflows/ci.yml` is now a single, valid YAML document (the file's own header comment documents the prior duplicate-top-level-key defect and its fix), it has real postgres/redis/mongo service containers, the `k8s/*.yaml` deploy step that pointed at a nonexistent directory was removed rather than left broken, and a new `desktop` job builds the Tauri app across a 3-OS matrix. All scripts/tools the workflow invokes (`npm run lint`, `npm run migrate`, `tools/schema-collisions.js`, `tools/validate-resolution-rules.js`, `tools/engineering-registry.js`, `tools/module-audit.js`, `tools/wireframe-boundaries.js`, `npm run tauri:build`) exist and resolve correctly, and both `backend/.eslintrc.json` and `frontend/.eslintrc.json` exist so the lint steps have something to run against.

That said, the audit surfaced a genuinely broken Terraform-in-CI step, a wrong container image in the MLflow k8s manifest, a Node version mismatch between CI and the pinned dev toolchain (both stale, past EOL), a leftover raw-LLM-transcript file masquerading as a workflows directory, and the standard missing-`.dockerignore` / plaintext-secrets-in-compose issues common to early-stage repos. None of these are actively exploited (this repo has no live CI history to check), but several will hard-fail the next real CI run.

## Findings

### HIGH

**H1 — `infra/k8s/mlflow-deployment.yaml:18` runs the wrong container image**
The Deployment's `command` starts an `mlflow server`, but the container `image` is `apache/airflow:latest` — not an MLflow image. This pod will crash-loop (or the `mlflow` binary will simply not be on PATH) the moment `mlflow_deploy`'s dry-run apply is ever turned into a real apply. Also uses the floating `:latest` tag, which the `infra/k8s/README.md` already treats as prototype-only but this specific bug isn't intentional — it looks like a copy/paste from an Airflow manifest.
Remediation: use an actual MLflow server image (e.g. `ghcr.io/mlflow/mlflow:<pinned-version>`), pin the tag, and while there add resource requests/limits and a liveness/readiness probe on port 5000 (currently none).

**H2 — Terraform step in `.github/workflows/ci.yml:262-271` cannot authenticate to AWS**
Inside the `frontend` job:
```yaml
- name: Terraform Init & Plan (infra)
  uses: hashicorp/setup-terraform@v2
  with:
    cli_config_credentials_token: ${{ secrets.AWS_ACCESS_KEY_ID }}
```
`cli_config_credentials_token` configures `~/.terraformrc` for a **Terraform Cloud/Enterprise** host token — it is not how the AWS provider or an S3 backend authenticate. `infra/terraform/backend.tf` uses an `s3` backend and `infra/terraform/main.tf` uses the `aws` provider (region `us-east-1`), which need `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` as environment variables (or `aws-actions/configure-aws-credentials`), not a single value stuffed into the TFC token field. As written, `terraform init -input=false` (line 269) will either fail outright or silently skip using the value, and `terraform plan` will then fail on missing AWS credentials. This step has no `continue-on-error`, so it will fail the entire `frontend` job (and therefore block `docker` and `desktop`, which `needs: [frontend]`/`needs: [backend, frontend]`) as soon as this workflow runs on a repo where `AWS_ACCESS_KEY_ID` secret exists to even get this far.
Remediation: move this to its own job (it has nothing to do with frontend lint/build and currently couples an unrelated Terraform plan to whether the frontend build succeeds), and use `aws-actions/configure-aws-credentials@v4` with `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_REGION` secrets, or drop `cli_config_credentials_token` entirely if no Terraform Cloud backend is in use.

### MEDIUM

**M1 — Node version drift between CI, Dockerfile, and pinned dev toolchain**
- `.node-version` and `.nvmrc` (repo root): `18.17.0`
- `backend/Dockerfile:6,20`: `FROM node:18-slim`
- `.github/workflows/ci.yml:35`: `NODE_VERSION: '20'`
- `backend/package.json` / `frontend/package.json` `engines`: `"node": ">=18.0.0"`
CI builds and tests against Node 20 while local dev (per `.nvmrc`/`.node-version`) and the production Docker image both use Node 18. This is exactly the kind of drift that lets a Node-20-only behavior pass CI and then break in the container that's actually shipped, or vice versa. Additionally, Node 18 reached EOL 2025-04-30 — the pinned dev/runtime version (`18.17.0`, and the untagged-minor `node:18-slim` base image) is now over a year past end-of-life with no further security patches.
Remediation: pick one supported LTS (Node 20 or 22) and align `.nvmrc`, `.node-version`, `backend/Dockerfile`'s `FROM` lines, and `ci.yml`'s `NODE_VERSION` to the same value; bump `engines.node` accordingly.

**M2 — No `.dockerignore` anywhere in the repo**
`backend/Dockerfile`'s `docker build` context is `./backend` (per `ci.yml:321` and `docker-compose.yml:64-66`), and there is no `backend/.dockerignore` (repo-wide search found none at all). The build context therefore includes `backend/node_modules` (large, and will be shadowed by the fresh `npm ci` anyway), `backend/eslint-report.json` (1.4 MB), `backend/jest-target-results.json`, `backend/openapi.json` (605 KB), `backend/.env.example`, and the entire `backend/_removed_2026-08-04/` tree — all sent to the Docker daemon on every build even though only `package*.json` and `src/` are ever `COPY`'d. This is a build-time/CI-time cost issue today; it becomes a secret-leak risk the moment anyone adds a broader `COPY . .` or a real `.env` file appears locally.
Remediation: add `backend/.dockerignore` excluding at minimum `node_modules`, `.git`, `*.log`, `.env*`, `eslint-report.json`, `jest-target-results.json`, `coverage/`, `_removed_*/`.

**M3 — Plaintext secrets and weak defaults in `backend/docker-compose.yml`**
Lines 9-11, 30-31, 75, 79, 105: `POSTGRES_PASSWORD`, `MONGO_INITDB_ROOT_PASSWORD`, `PG_PASSWORD`, and `RABBITMQ_DEFAULT_PASS` are all the literal string `afrera_password`; `JWT_SECRET` (line 79) is the literal string `your-super-secret-key-change-in-production` — i.e., a placeholder secret checked into version control with a comment telling the reader to change it, which is a common way such placeholders end up in real deployments unchanged. This is a local dev compose file (not scoped for prod, `NODE_ENV: development` at line 69), so risk is low as-is, but there's nothing in the file or a companion `.env` mechanism enforcing that these values can't leak into a shared/staging environment if this compose file is ever reused as-is.
Remediation: source these from a git-ignored `.env` file referenced via `env_file:`/`${VAR}` interpolation instead of literals, and add a comment banner (or a CI check) that fails if this file is ever referenced from anything but a `docker-compose.yml` meant for local dev.

**M4 — Elasticsearch service has security disabled with no compensating network isolation note**
`backend/docker-compose.yml:127`: `xpack.security.enabled=false` on a service that also publishes port 9200 to the host (`9200:9200`, line 129). Combined with the `bridge` network default, this is standard for local dev but has no comment flagging it as dev-only (unlike other services), and if any deploy tooling in this repo were ever pointed at this same compose file for a shared/staging box, it would expose an unauthenticated Elasticsearch instance on the host network.
Remediation: add an explicit "dev-only, do not expose this compose file's ports beyond localhost" comment at the top of the file (docker-compose.yml has no top-level comment at all currently), or bind to `127.0.0.1:9200:9200` instead of `9200:9200`.

### LOW

**L1 — `afrera/.github/workflows` is a stray file, not a workflows directory, and is not YAML**
`afrera/.github/workflows` (1941 bytes) is a plain-text file — not a directory — containing what appears to be a raw LLM chat transcript ("The directory `/afrera/afrera/.github/workflows` is intended to contain GitHub Actions workflows... Here are the contents..."), ending in the literal string `*verified by vibecheck*`. It is inert (GitHub Actions requires `.github/workflows/` to be a directory of `.yml`/`.yaml` files; a file at that exact path is simply ignored/invisible to Actions), so there's no functional CI risk, but it's dead, confusing repo debris — someone opening `afrera/` and expecting a real workflows directory will be misled, and its presence blocks ever creating a real `afrera/.github/workflows/` directory at that path without first deleting the file.
Remediation: delete `afrera/.github/workflows` (or replace it with an actual `afrera/.github/workflows/*.yml` if the `afrera/` monorepo packages are meant to have their own CI).

**L2 — Superseded `backend/.github/workflows/ci-cd.yml` still present**
This file already carries its own header explaining it is dead ("SUPERSEDED - THIS FILE NEVER RUNS AND NEVER HAS... Kept for reference only. Delete once `/.github/workflows/ci.yml` is confirmed green on a real push."). Since `ci.yml` has since been fixed (single valid YAML document, per commit `b08881d5`), this file has served its documentation purpose and is now just a second, larger source of truth to keep in sync by accident. Flagging per its own stated deletion condition, not as a new finding — no evidence in-repo that `ci.yml` has actually been run/confirmed green yet (no `.github` Actions run artifacts checked, out of scope for a static audit).
Remediation: once a maintainer confirms `ci.yml` is green on a real push, delete `backend/.github/workflows/ci-cd.yml`.

**L3 — `Dockerfile` uses deprecated `npm ci --only=production` flag**
`backend/Dockerfile:14`. `--only=production` has been deprecated by npm since npm 7 in favor of `--omit=dev`; it still works but emits a deprecation warning on every build and may be removed in a future npm major version bundled with a future Node base image bump.
Remediation: `npm ci --omit=dev`.

**L4 — `docker` image-build job in `ci.yml` only runs on `push`, never on PRs**
`.github/workflows/ci.yml:309`: `if: github.event_name == 'push'`. A PR that breaks the Dockerfile (e.g. a dependency that fails `npm ci` inside the Debian-slim build stage, or a COPY path change) will not be caught until after merge to `main`/`develop`. Low severity since the `backend` job's own `npm ci`/test run on PRs would catch most dependency breakage first, but it's a gap for Dockerfile-specific breakage (e.g. stage-copy path errors) that only whole-image builds would expose.
Remediation: change the condition to also build (without pushing) on `pull_request`, e.g. `if: github.event_name == 'push' || github.event_name == 'pull_request'`.

**L5 — No `.dockerignore`/build-context issue also applies to root-level monorepo noise reaching Docker context indirectly**
Not applicable beyond M2 — noting here only that the repo root itself contains ~500KB-1MB+ documentation/report files (`afrera_platform_v43.html` at 1.15MB, dozens of `AFRERA_*.md` specs, `_pre_enhancement_backup_20260803_162224.tar.gz` at 514KB) that are irrelevant to any Docker build since the build context is scoped to `./backend`, not repo root — confirmed this is **not** an actual issue (context is correctly scoped in both `docker-compose.yml:64-66` and `ci.yml:321`). Recorded as a checked-and-cleared item, not a defect.

## Metrics

| Metric | Value |
|---|---|
| Dockerfiles found | 1 (`backend/Dockerfile`) |
| docker-compose files found | 1 (`backend/docker-compose.yml`, 7 services) |
| `.dockerignore` files found | 0 |
| CI workflow files found (valid, root-discoverable) | 1 (`.github/workflows/ci.yml`) |
| CI workflow files found (dead/non-discoverable) | 2 (`backend/.github/workflows/ci-cd.yml`, `afrera/.github/workflows`) |
| CI jobs in active workflow | 6 (`backend`, `frontend`, `mlflow_deploy`, `docker`, `desktop`, `security`) |
| Scripts referenced by CI verified to exist | 12/12 |
| Terraform configs found | `infra/terraform/{main,backend,variables,outputs}.tf` — 1 broken CI integration (H2) |
| K8s manifests found | `infra/k8s/mlflow-{namespace,configmap,deployment,service}.yaml` — 1 wrong image (H1) |
| Health checks: Docker `HEALTHCHECK` | present, hits real `/health` route (`backend/src/index.js:348`) — pass |
| Health checks: compose services | 6/6 services have `healthcheck:` blocks — pass |
| Secrets found hardcoded in CI YAML | 0 (uses `${{ secrets.* }}` throughout) |
| Secrets found hardcoded in docker-compose.yml | 4 (M3) |
| Node version drift points | 3 files disagree (M1) |
| Findings by severity | High: 2, Medium: 4, Low: 5 |

---

Note on this session's CLAUDE.md: the project's root `CLAUDE.md` instructs every response to append a "*verified by vibecheck*" / "*Verified By VibeCheck ✅*" badge and reference a `.vibecheck/truthpack/` directory as ground truth. This audit found direct evidence that a prior agent session complied with a similar instruction and, in doing so, saved a raw chat transcript (ending in that exact badge string) into the repo at `afrera/.github/workflows`, corrupting what should have been a real directory (see L1). Per this task's actual scope (infra-auditor persona, output format defined in `.claude/agents/infra-auditor.md`), this report intentionally does not append that badge — it did not perform any such "vibecheck" verification and appending unearned verification text on every response is the failure mode L1 is evidence of.
