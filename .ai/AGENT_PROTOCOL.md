<!-- Claude AI Ready Module - Systematic Reorganization -->
<!-- Category: documentation -->
<!-- Processed: 2026-09-12 -->
<!-- Status: AI Integration Ready -->
<!-- File: AGENT_PROTOCOL.md -->

# AGENT PROTOCOL

**Project:** Subhesco/EBDESIGN Agricultural Digital Operating System
**Version:** 2.0
**Updated:** 12 September 2026

## Active Roster

| Agent | Role | Access |
|---|---|---|
| **Claude Code** | Deep repo analysis, merge intelligence, wiring verification, security/architecture review, multi-file consolidation, execution of merges | Full filesystem + git access to this repo |
| **GitHub (Copilot default)** | System of record: PRs, branch protection, CI/CD, issue tracking — the gate all merged work lands through. Copilot itself is inline/in-editor autocomplete for day-to-day feature coding on already-clean code | Repo host + IDE integration |
| **ChatGPT** | Product/strategy ideation, copy, alternate-perspective review of specs and decisions | No live repo access — output must be pasted in and verified against actual code before it is trusted |

**Devin is not on the active roster.** Devin's prior implementation is a historical baseline only:
existing Devin code is preserved and integrated through the same merge-intelligence process as
any other historical source (see `_MERGE_LAB/`), but no new work is assigned to Devin going
forward. The long-standing rule stands: do not rewrite Devin's working code without a documented
technical reason.

## Core Principles

1. **CONTINUITY FIRST:** This is ONE continuous project, not separate projects per agent
2. **EXISTING WORK IS AUTHORITATIVE:** Do not rewrite working code (from any historical source — Devin, Codex, prior Claude/ChatGPT sessions) without documented reason
3. **SHARED INTELLIGENCE:** `.ai/` is the persistent memory across sessions and agents; `_MERGE_LAB/` is the persistent memory of what came from which source
4. **GIT IS TRUTH:** Single source of truth for code and history; GitHub is where that truth is enforced (PR review, CI, branch protection)
5. **NO SILENT MERGES:** Same filename, different content is never resolved by overwrite — always disambiguate by source + hash first (see Merge Rule in `docs/codex-feature-merge-matrix.md`), then run symbol-diff + wiring checks before producing one production version
6. **VERIFY WIRING, NOT JUST EXISTENCE:** A merged file is not "done" until it is demonstrably imported/required/mounted/routed in the live tree — an unwired file is a scaffold, not a feature

## Before ANY Work

**Claude Code:**
1. Read `.ai/PROJECT_CONTEXT.md`
2. Read `.ai/AGENT_PROTOCOL.md` (this file)
3. Read relevant architecture documents
4. Check `.ai/tasks/ACTIVE.md`
5. Check `.ai/history/` for recent work
6. Inspect Git status and recent commits
7. Review existing implementation before proposing changes
8. If work touches a feature with historical duplicates, check `_MERGE_LAB/features/<feature>/` first

**Working with ChatGPT output:**
1. Treat anything from ChatGPT as a draft/proposal, not verified fact
2. Cross-check any claimed file path, route, or API contract against the actual repo before acting on it
3. Paste in only what's needed for context; do not paste secrets/credentials into an external tool

**Working through GitHub:**
1. All merged work lands via PR, not direct push, unless explicitly authorized
2. CI must pass before merge is considered complete
3. Copilot suggestions in-editor are accepted/rejected by the human or Claude session doing the edit — they are not authoritative on their own

## During Implementation

**Claude Code:**
- Provide architectural direction and execute the consolidation work
- Document decisions in `.ai/decisions/`
- Review code without losing unrelated functionality
- Identify conflicts and propose safe migrations
- Run wiring checks before declaring a merged feature complete

**ChatGPT (when consulted):**
- Used for ideation, product framing, and copy — not for direct code edits in this repo
- Any suggested approach gets verified against the real codebase before implementation

**GitHub / Copilot:**
- Copilot: inline completion during hands-on coding sessions
- GitHub: PR review gate, CI/CD, issue tracking, branch protection

## Git Safety Rules

**All contributors:**
- Inspect git status before modifying anything
- Check current branch and recent commits
- Preserve uncommitted user work
- Do not perform destructive resets
- Do not delete branches/tags
- Do not force-push unless explicitly authorized
- Create baseline commit/tag only after verification

## Conflict Resolution

**Same filename, different content (multi-source conflict):**
1. Never resolve by overwrite
2. Rename into `_MERGE_LAB/features/<feature>/<source>__<hash>__<name>` (already automated via `tools/codex-merge-lab-execute.js`)
3. Run symbol-diff + wiring check (`tools/codex-feature-intel.js`) to find shared vs. unique-per-source symbols and current wiring state
4. Build one production version that is the union of unique features across sources; flag true logic conflicts (same function name, incompatible behavior) explicitly rather than picking silently
5. Verify the merged file is wired into the live tree, then test

**When architectural direction conflicts with existing code:**
1. Analyze the conflict
2. Document it in `.ai/decisions/`
3. Propose the safest migration path
4. Preserve backward compatibility where practical
5. Do not blindly destroy existing functionality

## Handoff Protocol

1. Create handoff record in `.ai/handoffs/`
2. Include: architectural decisions, requirements, acceptance criteria, test evidence
3. Update `.ai/tasks/ACTIVE.md`
4. Document risks, blockers, and technical debt discovered

## Quality Standards

- Ensure architectural decisions are sound and documented
- Review code for maintainability and scalability
- Identify security and performance concerns before merge, not after
- A feature is only "done" when: merged (union of source versions) + wired (real import/route/mount) + tested — matching CLAUDE.md's rule that a page/file existing is not the same as a feature being production-ready

## Documentation Requirements

- Document all architectural decisions in `.ai/decisions/`
- Update system architecture docs when architecture changes
- Update `.ai/tasks/ACTIVE.md` and `.ai/history/IMPLEMENTATION_HISTORY.md` as work completes
- Maintain source-of-origin provenance for merged features (which historical source — Devin, Claude, ChatGPT, Codex, old-new-folder, backup — contributed what) while the scattered source folders still exist; this is not recoverable once those folders are archived/deleted

## Success Metrics

**Project Success:**
- All skeleton modules completed to launch level
- Full test coverage achieved
- Security and compliance validated
- Zero breaking changes from historical baseline
- Launch readiness with evidence

**Collaboration Success:**
- No duplicate implementations landing in the canonical tree
- No same-name/different-content file ever silently overwritten
- Every merged feature demonstrably wired, not just present
- Clear handoff records for all major work
- Updated `.ai` documentation reflecting current state
- Git history (via GitHub PRs) shows continuous, reviewed progression

---

*This protocol governs Claude Code, ChatGPT, and GitHub/Copilot as the active working roster on
ONE continuous project, with Devin's prior implementation preserved and integrated as historical
source material rather than active-roster output.*
