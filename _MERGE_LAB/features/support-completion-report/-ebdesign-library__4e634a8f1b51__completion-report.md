# Library Module Large-File Optimization — Completion Report

**Date:** 23 August 2026
**Status:** Optimization complete and verified. Content-quality findings below require a follow-up decision before building a "useful" index.

## What was done

Ten large CSV registries under the library/forensic tree were split into gzip-compressed,
independently-readable parts, using a streaming byte-exact newline-boundary splitter with
per-file SHA256 reconstruction verification (decompress every part, strip the duplicated
header from parts 2..N, rehash, compare against a freshly streamed hash of the untouched
original). All ten passed. Originals were left untouched throughout (no deletion, no
in-place modification) — output lives entirely under `LARGE_FILE_OPTIMISATION/`.

| File | Original | Parts | Compressed | Ratio |
|---|---:|---:|---:|---:|
| `02_IMPORT_DEPENDENCY_MAP.csv` | 4.456 GB | 17 | 693.7 MB | 6.42x |
| `03_API_ROUTE_MAP.csv` | 12.022 GB | 45 | 1.886 GB | 6.37x |
| `06_ORPHAN_BACKEND_ROUTES.csv` | 2.838 GB | 11 | 439.9 MB | 6.45x |
| `07_EFFECTIVE_ROUTE_CANDIDATES.csv` | 2.841 GB | 11 | 439.8 MB | 6.46x |
| `PHYSICAL_ITEM_IDENTITY_REGISTRY.csv` (live authority) | 195.23 MB | 5 | 19.47 MB | 10.51x |
| 5 more copies/backups of the identity registry (STAGED/BEFORE/PRE_PROMOTION, current + prior run) | ~195 MB each | 5 each | ~19.4 MB each | ~10.6x |

**Totals: 23.383 GB → 3.575 GB, 19.808 GB saved (6.54x), 119 parts, 100% reconstruction-verified.**

This corrects an earlier same-day entry in this same file (and in `00_CATALOG/LIBRARY_MANIFEST.json`)
that reported the four forensic-index files as 71–287 MB each — those numbers were actually
single-part sizes mistaken for whole-file sizes — and a "~1.1GB total space saved" figure that
only reflected the six small registry-copy files. The real figure, computed directly from the
verified manifests and confirmed against on-disk file sizes, is **19.8GB saved**, not 1.1GB. One
of the ten directories (`09_IDENTITY_REGISTRY_...`) also appears to be a redundant duplicate split
of the same source as `08_PHYSICAL_ITEM_IDENTITY_REGISTRY` (identical compressed size) — left in
place, not deleted, but flagged as safe to remove later.

## What's actually *in* the four big forensic files (the real finding)

A byte-accurate classification pass (path-column pattern match + true per-line byte length,
not a naive comma-split, which undercounted pathological rows on the first attempt) over all
22.1GB of source content found:

| Category | Bytes | Share |
|---|---:|---:|
| **Worktree duplication** — same route/import data scanned across all 11 `.claude/worktrees/*` snapshots plus the main tree | ~19.70 GB | 89.1% |
| **Generated-report ingestion bug** — `eslint-report.json` files (one per worktree) misclassified as backend route source; their *entire* JSON body, including full linted-file source text, got dumped into a single CSV "Evidence" cell (worst single line: 1.49MB) | ~2.17 GB | 9.8% |
| **Genuine unique signal** (`backend/`, `frontend/` real paths) | ~238 MB | 1.1% |
| Docs/other | ~1.2 MB | ~0% |

Of that ~238MB "real" slice, the large majority (~223MB, from `03_API_ROUTE_MAP.csv`) is
minified/bundled third-party vendor JS under `frontend/android/app/.../assets/vendor-*.js`
(Capacitor/Android build output), not hand-authored source. The genuinely unique,
hand-written signal — actual `backend/` route and import definitions, once — is on the
order of **~3.5MB total** across all four files combined.

**Conclusion:** these four files are not 22GB of information. They are a few MB of real
signal, replicated ~12x by worktree scanning, plus a tool bug that vacuumed up ESLint
reports as if they were source code. The verified, compressed, split archive (3.575GB) is
now the safe, non-destructive preservation of everything as it was scanned. It is not,
and should not be presented as, the *useful* index.

## Recommendation (not yet executed — decision point)

Build a fifth, small, deduplicated index — e.g. `10_DEDUPLICATED_ROUTE_INDEX.csv` — containing
only rows classified `REAL_BACKEND_SOURCE` / genuine `REAL_FRONTEND_SOURCE` (excluding
`frontend/android` vendor bundles), deduplicated by (path, line, reference). Expected size:
low single-digit MB. This would be the fast, trustworthy artifact for future route/import
lookups; the compressed 3.575GB archive stays as the full forensic backup. Not built yet —
flagging for a decision rather than silently generating a new "authoritative" file.

## Known gap: source directories were deleted by a separate concurrent session

While this optimization was running, another active Claude Code session on this machine
(`ebdesign-6b`) deleted `_EBDESIGN_FORENSIC_INDEX/`, `_JUNK_QUARANTINE/`,
`_AFRERA_MASTER_DISCOVERY/`, `_CANONICAL_AUDIT/`, `_POWERSHELL_FORENSIC_DEBUGGER/`, and
`_SUBH_FORENSIC_REBUILD/` outright — including the four original CSVs this report
optimizes, and the quarantine record for the duplicate `_CONTROL` root created earlier the
same day. This breaks the project's own "no permanent deletion" rule. The data is not lost
— every byte is reconstructable from the verified, hashed parts in this directory — but the
raw originals and the quarantine trail are gone from disk and were never git-tracked, so
there is no other recovery path. Flagging for awareness; not something this session
reversed or attempted to fix unilaterally.

## Verification

- Reconstruction: SHA256(original) == SHA256(concatenated parts, headers stripped) for all 10 files — see each `MANIFEST.json`.
- Content classification: `CONTENT_CLASSIFICATION_BYTES.json` in this directory (raw counts, byte totals per category, per file).
- Disk safety: split output totals 3.575GB; originals (where they still exist) were never modified.
