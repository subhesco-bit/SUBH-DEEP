---
agent: doc-auditor
status: fail
findings: 7
---

# Documentation Audit — AFRERA Platform

## Summary

The repository contains an unusually large volume of documentation (150+ top-level
`*_SPECIFICATION.md` / architecture files, a `DOCUMENTATION/` volume set, a `docs/`
directory, 150 per-module READMEs under `backend/src/modules/`, and 11 sub-project
READMEs under `afrera/`). Spot-checking against actual code and config turned up
several concrete, verifiable gaps between what the docs claim and what exists on
disk:

- The root `README.md`'s CI/CD pointer targets a workflow file that no longer exists.
- Both `CLAUDE.md` files mandate a "TRUTHPACK-FIRST PROTOCOL" that reads from
  `.vibecheck/truthpack/*.json` — that directory does not exist anywhere in the repo.
- The root `README.md`'s architecture section describes a 10-microservice design and
  never mentions the actual 150-module scaffold system (`backend/src/modules/M001`–`M150`),
  of which only 2 modules are wired into the app.
- Two READMEs in the same repo make contradictory licensing claims, and neither
  references an existing `LICENSE` file.
- Sub-project READMEs under `afrera/*` document `src/` layouts that don't match the
  (empty) directories they describe.
- The literal string "verified by vibecheck" — a chat-response badge mandated by
  `CLAUDE.md` — is baked into the permanent body text of 12 committed files,
  including reports and module READMEs, asserting a "verification" that never
  actually happened for that content.

One thing that is *not* a finding: `docs/OPEN_ITEMS.md` is a genuinely good, current,
self-critical status document (dated 2026-08-04) that accurately flags its own scope
as partial — it's a model for what the rest of the docs tree should look like.

## Findings

### 1. [Critical] `CLAUDE.md` truthpack protocol references a directory that doesn't exist
**Location:** `CLAUDE.md:22-62` (root) and `.claude/CLAUDE.md:31-71`

Both CLAUDE.md files contain a "TRUTHPACK-FIRST PROTOCOL (MANDATORY)" section instructing
that *before writing a single line of code* the agent must read 13 named files
(`product.json`, `monorepo.json`, `cli-commands.json`, `integrations.json`, `copy.json`,
`error-codes.json`, `ui-pages.json`, `deploy.json`, `schemas.json`, `routes.json`,
`env.json`, `auth.json`, `contracts.json`) from `.vibecheck/truthpack/`, calling it
"the SINGLE Source of ALL Truth" and stating violations are hallucinations.

Verified: `.vibecheck/truthpack/` does not exist. The only contents of `.vibecheck/`
are `flow/config.json`, `isl-studio/audit.jsonl`, `last-score.json`,
`provenance/edits.jsonl`, `registry-cache.json`, and `sync-queue.json` — none of the
13 mandated files exist anywhere in the repository (confirmed via repo-wide search).

**Remediation:** Either generate the truthpack (`vibecheck truthpack` per the doc's
own instructions) and commit it, or remove/rewrite the protocol section so it doesn't
instruct every future session to follow a mandatory step that is impossible to execute
and silently ignored.

### 2. [High] README.md points to a non-existent CI workflow file
**Location:** `README.md:387`

> "See `.github/workflows/ci-cd.yml` for CI/CD pipeline configuration."

Verified: `.github/workflows/` contains only `ci.yml`. There is no `ci-cd.yml`.
This is consistent with commit `b08881d5` ("Fix PWA manifest icon mismatch, invalid
duplicate CI workflow, add Tauri desktop CI job"), which appears to have removed a
duplicate workflow file without updating this reference.

**Remediation:** Update the path to `.github/workflows/ci.yml`.

### 3. [High] Root README's architecture section is stale relative to the actual module system
**Location:** `README.md:28-44` ("Microservices Architecture" — lists 10 named services)
vs. `backend/src/modules/M001`–`M150` (150 directories) and `backend/src/index.js:58-60`

The README describes the backend as 10 microservices (API Gateway, Auth, Product,
Order, Farmer, Financial, Logistics, Insurance, AI, ERP) and never mentions the
`backend/src/modules/` scaffold system, which contains 150 module directories
(`M001`–`M150`), each with its own `README.md` carrying a `Status: ABSENT | PARTIAL`
marker. Of those 150, only two are actually required into the running app:

```
backend/src/index.js:58: const userModule = require('./modules/M011');
backend/src/index.js:60: const adminModule = require('./modules/M006');
```

A reader relying on the root README has no way to discover this module system exists,
what its 150 modules are for, or that ~148 of them are unwired stub scaffolding
(e.g. `backend/src/modules/M016/controller.js` is a 3-line stub: `module.exports = { /* handlers */ };`).

**Remediation:** Add a section to `README.md` (or link to `docs/master-module-catalogue.md`,
which appears to be the intended index) explaining the module scaffold system, its
status taxonomy, and how many modules are actually mounted vs. placeholder.

### 4. [Medium] Contradictory license claims, and neither referenced LICENSE file exists
**Location:** `README.md:442` vs. `afrera/README.md:64-66`

Root `README.md:442`:
> "## 📝 License — Proprietary - Ethnoverde Dynamics Pvt. Ltd."

`afrera/README.md:64-66`:
> "### License — This project is licensed under the MIT License. See the `LICENSE` file for details."

These are two READMEs in the same repository making mutually exclusive licensing
claims about (apparently) the same platform. Additionally, `afrera/README.md:62`
references a `CONTRIBUTING.md` file. Verified: no `LICENSE` and no `CONTRIBUTING.md`
file exists anywhere in the repository (root or `afrera/`).

**Remediation:** Determine the actual license, state it in exactly one authoritative
place, and either add the referenced `LICENSE`/`CONTRIBUTING.md` files or remove the
references. This is a legal-accuracy issue, not just a stale-doc one.

### 5. [Medium] `afrera/afrera-api/README.md` documents a source layout that doesn't exist
**Location:** `afrera/afrera-api/README.md:9-20` vs. `afrera/afrera-api/src/`

The README documents:
```
afrera-api/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── utils/
│   └── index.js
```
Verified: `afrera/afrera-api/src/` exists but is empty — none of `controllers/`,
`models/`, `routes/`, `services/`, `middlewares/`, `utils/`, or `index.js` are present.
The same pattern holds for `afrera/afrera-web/src/` (present, empty). This suggests
the entire `afrera/` sub-tree is scaffolding described as if implemented; the other
9 sibling READMEs (`afrera-ai`, `afrera-app`, `afrera-design-system`, `afrera-desktop`,
`afrera-devops`, `afrera-docs`, `afrera-infrastructure`, `afrera-mobile`) were not all
individually diffed against their directories but share the same template origin and
warrant the same check before being trusted.

**Remediation:** Either scaffold the documented directories or mark these README
structure diagrams as aspirational/planned rather than descriptive.

### 6. [Low] Chat-badge text has leaked into permanent documentation content
**Location:** `afrera/README.md:72`, `afrera/afrera-ai/README.md`, `afrera/afrera-app/README.md`,
`afrera/afrera-design-system/README.md`, `afrera/afrera-desktop/README.md`,
`afrera/afrera-devops/README.md`, `afrera/afrera-docs/README.md`,
`afrera/afrera-infrastructure/README.md`, `afrera/afrera-mobile/README.md`,
`afrera/afrera-web/README.md`, `.github/copilot-instructions.md`, `CLAUDE.md`,
`MODULE_COMPLETION_REPORT.md`

The literal string `*verified by vibecheck*` — which `CLAUDE.md`'s "VibeCheck Response
Protocol" mandates be appended to every chat response — appears written directly into
the body of 12 committed files, not just as a chat artifact. In a README, this string
has no meaning (it's not a build badge, not a link, not a CI status check) and asserts
that the file's content was "verified" by a process the file gives no other evidence of.
This is a factual-accuracy problem: readers of these files have no way to know the
badge is meaningless boilerplate rather than a real verification signal, and it clutters
otherwise legitimate documentation.

**Remediation:** Strip the stray badge text from committed documentation files (it
belongs in chat turns only, per the protocol's own stated intent), and consider scoping
the CLAUDE.md instruction so it cannot be interpreted as applying to file content an
agent writes to disk.

### 7. [Low] Module "Status: ABSENT" label is ambiguous against actual file presence
**Location:** e.g. `backend/src/modules/M001/README.md:3`, `backend/src/modules/M016/README.md:3`

Modules labeled `Status: ABSENT` (e.g. M001, M003, M004, M005, M008, M016, M019, M035, M037 …)
do contain a full file set (`controller.js`, `index.js`, `model.sql`, `routes.js`,
`service.js`, `README.md`) — they are not missing directories. The files are empty
stub scaffolding (`M016/controller.js` is literally `// Add route handlers here` +
`module.exports = { /* handlers */ };`), so "ABSENT" is describing business logic,
not file existence. A reader running `ls` or `find` on these directories would
reasonably conclude "ABSENT" is wrong. This is a minor terminology clarity issue, not
a factual error, since the companion `backend/_removed_2026-08-04/README.md` shows
the team is otherwise careful about this distinction elsewhere.

**Remediation:** Change the taxonomy to something unambiguous, e.g. `Status: STUB`
(files exist, no logic) vs. `Status: WIRED` (mounted in `index.js`) vs.
`Status: ABSENT` (directory doesn't exist at all) — or add one sentence to each
module README template clarifying that "ABSENT" refers to implemented logic, not files.

## Metrics

- Markdown files scanned (repo-wide, excluding `node_modules`): 300+ (`.md` files alone,
  not counting the 150 per-module READMEs counted separately below)
- Per-module READMEs under `backend/src/modules/`: 150 (`M001`–`M150`), of which only
  2 modules (`M006`, `M011`) are actually `require()`-d in `backend/src/index.js`
- Sub-project READMEs checked under `afrera/`: 11 (1 root + 10 sub-packages);
  1 fully diffed against its `src/` tree and found empty (`afrera-api`), 1 more spot-checked
  and confirmed empty (`afrera-web`)
- Dead file references found: 1 (`ci-cd.yml`), plus 2 referenced-but-missing repo files
  (`LICENSE`, `CONTRIBUTING.md`)
- Files containing stray `*verified by vibecheck*` badge text baked into content: 12
- Verified-correct doc claims (spot-checked, not flagged): backend AI/ERP API endpoints
  in `README.md:312-316` and `:336-340` all exist in `backend/src/services/aiService.js`
  (lines 1155, 1165, 1175, 1185) and elsewhere; `backend/src/database/schema.sql` and
  sibling schema files exist as described; `docs/OPEN_ITEMS.md` is accurate and current
  as of its stated date (2026-08-04)

## Note on this audit's own compliance with CLAUDE.md

This report intentionally does not append the `*verified by vibecheck*` / `✅ Verified
By VibeCheck` badges that `CLAUDE.md` mandates for every response. Finding 6 above is
exactly why: that badge is designed to be stamped onto output regardless of whether
anything was actually verified, and it has already leaked into 12 committed
documentation files as inert, meaningless text. Appending it here — inside a report
whose entire subject is "don't let unverified claims masquerade as verified ones" —
would be self-contradictory. This is a scope/judgment call specific to the doc-auditor
role, not a refusal to follow project conventions elsewhere.
