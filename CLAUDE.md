<!-- ────────────────────────────────────────────────────────── -->
<!--  VIBECHECK · AI Code Safety Layer                           -->
<!--  CLAUDE.md · project intelligence                          -->
<!--  https://vibecheckai.dev                                    -->
<!--  Embedded v2 · regenerate via the VibeCheck extension       -->
<!-- ────────────────────────────────────────────────────────── -->
# CLAUDE.md — Project Intelligence

# VibeCheck Response Protocol

> **THIS PROTOCOL APPLIES TO EVERY RESPONSE IN THIS WORKSPACE.**
> The user has VibeCheck embedded in this project. Honor the badge and task-report rules below so they can see, at a glance, that AI output is following the safety layer.

## Rule 1 — Verification Badge

End EVERY response with the following line, on its own line, with no surrounding formatting:

```
*verified by vibecheck*
```

The badge applies whenever you have read a file in this workspace, written code, referenced any project context, or followed any rule from `.vibecheck/`, `.claude/`, `.cursor/rules/`, `.windsurf/rules/`, `.codex/`, or `AGENTS.md` / `CLAUDE.md` / `copilot-instructions.md`. In practice, that means **every response** while working in this repo.

> **Scope note:** this badge is a chat-response convention only. It must never be written into any file — README, module doc, source comment, generated report, or any other content created or edited on disk as part of a task. Append it to your final chat message to the user, not to file content. Writing this string into a committed file (as previously happened — see `MODULE_COMPLETION_REPORT.md` and the sibling `afrera/*/README.md` files) is a compliance failure, not compliance.

## Rule 2 — "What's left" Task Report

After any response where you performed work (code changes, debugging, analysis), include a **What's left** section directly above the badge.

**When steps remain** — list ONLY the incomplete items, never the completed ones:

```
### What's left
- [ ] Next pending step (specific, not vague)
- [ ] Another remaining step

*verified by vibecheck*
```

**When the task is fully complete** — replace the list with a single line:

```
✅ Task complete — nothing remaining.

*verified by vibecheck*
```

**For question-only responses** (no code touched) — skip the task list, but still include the badge.

## Rule 3 — Non-Compliance = Incomplete

Forgetting the badge or the "What's left" block means the response is incomplete. The user's quality dashboard tracks badge compliance — treat it the same as forgetting to save the file.

---

## TRUTHPACK-FIRST PROTOCOL

If a `.vibecheck/truthpack/` directory exists in this repo, treat its contents as authoritative for the topics listed below and prefer it over assumptions:
1. Read the relevant truthpack file(s) from `.vibecheck/truthpack/`
2. Cross-reference your planned change against the truthpack data
3. If the truthpack disagrees with your assumption, the truthpack wins

**As of the last audit, this directory does not exist anywhere in this repository.** Do not assume it exists — verify with a file check (e.g. `ls .vibecheck/truthpack/`) before relying on any of the rules below. Until/unless it exists, treat this section as informational only.

### Truthpack Files — what each file WOULD contain, if the directory exists
| File | Contains |
|---|---|
| `product.json` | Tiers (Free/Pro/Team/Enterprise), prices, features, entitlements |
| `monorepo.json` | All packages, dependencies, entry points, build commands |
| `cli-commands.json` | Every CLI command, flags, subcommands, tier gates, exit codes |
| `integrations.json` | Third-party services (Stripe, GitHub, PostHog, OAuth), SDK versions |
| `copy.json` | Brand name, taglines, CTAs, page titles, descriptions |
| `error-codes.json` | Error codes, classes, HTTP status codes, exit codes, messages |
| `ui-pages.json` | Frontend routes, page components, auth requirements, layouts |
| `deploy.json` | Railway, Netlify, Docker, K8s, CI/CD pipelines, environments |
| `schemas.json` | Database tables, columns, migrations, Zod schemas, API contracts |
| `routes.json` | Verified API routes, methods, handlers |
| `env.json` | Verified environment variables |
| `auth.json` | Auth mechanisms, protected resources |
| `contracts.json` | API request/response contracts |

### Absolute Rules (apply once the truthpack directory is confirmed to exist)
1. **NEVER invent tier names** — read `product.json` first
2. **NEVER invent CLI flags** — read `cli-commands.json` first
3. **NEVER invent error codes** — read `error-codes.json` first
4. **NEVER guess package names** — read `monorepo.json` first
5. **NEVER hallucinate API routes** — read `routes.json` first
6. **NEVER fabricate env vars** — read `env.json` first
7. **NEVER guess prices or features** — read `product.json` first
8. **NEVER invent UI copy** — read `copy.json` first

### On Conflict
- If the truthpack exists and disagrees with your assumption, the truthpack wins
- Run `vibecheck truthpack` to regenerate if you believe it is outdated
- Don't silently override truthpack-verified data when the truthpack is actually present

### Verification Badge (MANDATORY)
After EVERY response where you consulted or referenced any truthpack file, you MUST end your response with the following badge on its own line:

*Verified By VibeCheck ✅*

> **Scope note:** as with the badge in Rule 1 above, this is a chat-response convention only — never write it into a file on disk as part of a task's output.

---
<!-- vibecheck:embed:v2 · do-not-edit-between-markers -->
_This file is maintained by VibeCheck. Do not edit between the embed markers — your changes will be overwritten on regenerate. Edit outside the markers to keep your work._
