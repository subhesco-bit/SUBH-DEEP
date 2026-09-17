# Unified Project Integration Report

Generated: 2026-09-12T14:09:15.082Z

## Preservation Guarantee

- Original source roots modified: 0
- Original files deleted: 0
- New independent project: `_UNIFIED_PROJECT/current`
- Baseline manifest: `_UNIFIED_PROJECT/audit/unified-project-baseline.csv`
- Source-to-target files verified by SHA-256: 9,398
- Copy hash mismatches: 0
- Target files missing from source baseline: 0

## Scan

- Total Library records scanned: 5,12,239
- Merge-eligible project files studied: 66,518
- Generated, dependency, backup, build, source-control, or sensitive records excluded from feature merging: 4,45,721

| Exclusion class | Files |
| --- | ---: |
| dependency_cache | 3,59,686 |
| generated_project_artifact | 36,247 |
| source_control_metadata | 22,995 |
| backup_or_archive | 17,565 |
| agent_workspace | 7,951 |
| build_output | 1,226 |
| library_generated_artifact | 29 |
| secret_or_credential | 22 |

## Grouping And Merge State

- Same-name groups formed: 4,746
- Files represented in those groups: 64,188
- Exact-content groups tested and frozen: 2,229
- Different-content groups queued: 2,517
- Same-name/different-purpose groups: 1,600
- Descriptive virtual renames and placements: 17,563
- Repeated candidate copies collapsed to audited aliases: 28,214
- Same-purpose implementation merge tasks: 2,864
- Separate-purpose placement-only tasks: 2,569
- Test cycles executed: 2,229
- Test passes: 2,229
- Test failures: 0

## Audit Artifacts

- `duplicate-groups.jsonl`: complete group evidence and canonical selection
- `file-feature-study.jsonl`: purpose, dependency, placement, and identity for every eligible file
- `rename-placement-plan.csv`: non-destructive names for differing files
- `merge-plan.jsonl`: bounded multi-agent merge queue
- `test-results.jsonl`: reproducible validation results
- `cleanup-plan.csv`: exclusions permitted only inside the new unified project

## Freeze Rule

Exact duplicates are frozen by SHA-256 equivalence. Different-content files are not declared merged until their feature tests, project build, security checks, and audit event all pass. This prevents a filename-based merge from losing behavior.

## Semantic Validation Cycle

- Divergent groups processed: 5,433
- Candidate files hash-verified: 17,563
- Candidate verification failures: 0
- Formatting or JSON-equivalent groups additionally frozen: 1,316
- Separate-purpose placement tasks validated without cross-purpose merging: 2,569
- Groups requiring feature-level merge: 1,520
- Binary or oversized groups requiring specialized review: 28
- Multi-agent assignment log: `_UNIFIED_PROJECT/audit/multi-agent-assignments.jsonl`
