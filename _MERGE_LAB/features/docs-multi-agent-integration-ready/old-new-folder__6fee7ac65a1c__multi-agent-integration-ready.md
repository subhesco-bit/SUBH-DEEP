# Multi-Agent Integration Status

**Repository:** AFRERA-EBDESIGN
**Coordination:** Devin + VS Code/Visual Studio + Claude AI
**Status:** Local coworking foundation configured

## Available integration points

- `CLAUDE.md` and `.claude/CLAUDE.md`: Claude operating rules
- `.ai/AGENT_PROTOCOL.md`: shared handoff and Git protocol
- `.ai/architecture/MODULAR_PRODUCT_SYSTEMS.md`: modular product boundaries
- `.github/copilot-instructions.md`: VS Code Copilot project rules
- `.github/workflows/ci.yml`: shared backend and frontend CI
- `.vscode/`: tasks, launch profiles, and editor settings
- `.githooks/`: non-destructive commit and merge event logging
- `setup-coworking.ps1`: Windows setup
- `setup-coworking.sh`: Unix setup

## Important truth

This setup does not claim that Git hooks can directly synchronize independent
AI sessions or generate images without a configured service. It provides the
shared repository, handoff files, reproducible commands, and CI gates needed
for those agents to collaborate safely.

## GitHub Enterprise

Use the repository on the enterprise host with Actions enabled. Store
`ANTHROPIC_API_KEY` and other deployment credentials as enterprise or repository
Actions secrets. The workflow requests read-only repository contents permission
and does not require a GitHub.com-specific API endpoint.
