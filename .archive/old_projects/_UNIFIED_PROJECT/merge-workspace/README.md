# Virtual Merge Workspace

This workspace is represented by Library IDs and immutable source paths in the audit manifests. It avoids duplicating gigabytes of data on a disk with limited free space. Agents must verify each expected SHA-256 before reading a candidate and write merged implementations only to `_UNIFIED_PROJECT/current`.
