# Visual Studio and Claude Coworking Setup

AFRERA uses one repository as the shared source of truth for Devin, VS Code or
Visual Studio, and Claude. The `.ai/` directory contains coordination memory;
`CLAUDE.md` and `.github/copilot-instructions.md` define agent rules.

## Windows setup

From the repository root in PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup-coworking.ps1
```

Open `EBDESIGN.code-workspace` in VS Code. Visual Studio can open the same
repository directory and uses the same Git branch, files, scripts, and CI.

## Daily workflow

1. Check `git status` and `.ai/tasks/ACTIVE.md` before editing.
2. Work on a named branch for a focused change.
3. Run the relevant VS Code task or backend/frontend command.
4. Record architectural decisions and handoffs in `.ai/`.
5. Commit only reviewed changes. The hooks record local commit/merge events;
   they do not auto-commit, push, merge, or call an undocumented service.
6. Use the repository's GitHub Actions workflow for shared CI. It works with
   GitHub Enterprise Server when Actions and the referenced actions are enabled
   by the enterprise administrator.

## Claude live API

The backend reads `ANTHROPIC_API_KEY` only from the backend runtime environment.
Set it in an untracked `backend/.env` file or in the GitHub Enterprise Actions
secret store. Never put it in frontend variables, source files, commits, logs,
or chat messages.

```powershell
Copy-Item backend/.env.example backend/.env
notepad backend/.env
```

## Boundaries

Git hooks provide local coordination only. They cannot make independent agents
share memory automatically or guarantee conflict-free parallel edits. Claude,
Devin, and IDE users must still coordinate through Git branches and `.ai/`
handoffs. CI is the authoritative shared verification point.
