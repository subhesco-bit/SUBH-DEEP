#!/usr/bin/env sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$repo_root"

[ -d .git ] || { echo 'Run this script from a Git repository.' >&2; exit 1; }
git config core.hooksPath .githooks
git config merge.tool vscode
git config mergetool.vscode.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'
mkdir -p .ai/runtime
touch .ai/runtime/coworking-events.log
printf '%s\n' 'AFRERA coworking integration configured.'
printf '%s\n' 'Secrets remain external: set ANTHROPIC_API_KEY in backend/.env or deployment secret management.'
