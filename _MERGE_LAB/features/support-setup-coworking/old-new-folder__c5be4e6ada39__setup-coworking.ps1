[CmdletBinding()]
param(
    [switch]$SkipGitConfig
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot '.git'))) {
    throw "Run this script from a Git repository."
}

if (-not $SkipGitConfig) {
    git config core.hooksPath .githooks
    git config merge.tool vscode
    git config mergetool.vscode.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'
}

New-Item -ItemType Directory -Force -Path (Join-Path $repoRoot '.ai\runtime') | Out-Null
$runtimeLog = Join-Path $repoRoot '.ai\runtime\coworking-events.log'
if (-not (Test-Path -LiteralPath $runtimeLog)) {
    New-Item -ItemType File -Path $runtimeLog | Out-Null
}

Write-Host 'AFRERA coworking integration configured.'
Write-Host "Git hooks: $(git config --get core.hooksPath)"
Write-Host 'VS Code workspace: EBDESIGN.code-workspace'
Write-Host 'Claude coordination: CLAUDE.md, .claude/CLAUDE.md, and .ai/AGENT_PROTOCOL.md'
Write-Host 'Secrets remain external: set ANTHROPIC_API_KEY in backend/.env or deployment secret management.'
