#!/usr/bin/env bash
# Create or update Dev Swarm GitHub labels (idempotent). Used by wire session.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
REPO="${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)}"
if [[ -z "$REPO" ]]; then
  echo "ERROR: cannot resolve GitHub repo. Set GITHUB_REPOSITORY or run from a git repo with gh auth." >&2
  exit 1
fi
labels=(
  "swarm:planned:cfd3d7:Issue planned, not ready"
  "swarm:ready:0e8a16:Ready for executor automation"
  "swarm:in-progress:fbca04:Executor active"
  "swarm:review-ready:1d76db:Ready for reviewer"
  "swarm:merge-ready:2da44e:Verify passed, integrator may merge"
  "swarm:blocked:d73a4a:Blocked — chairman/orchestrator"
  "swarm:done:0e8a16:Issue complete on development"
  "runtime:cursor:5319e7:Cursor executor runtime"
  "runtime:codex:1f6feb:Codex executor runtime"
  "tier:standard:c5def5:Standard verify tier"
  "tier:critical:b60205:Critical verify tier"
  "swarm:program-active:0366d6:Program running"
  "swarm:chairman-stop:e99695:Scheduled chairman checkpoint"
  "swarm:promote-staging:FBCA04:Chairman authorized staging promotion"
  "swarm:promote-main:B60205:Chairman authorized main promotion"
)
created=0
updated=0
for entry in "${labels[@]}"; do
  IFS=':' read -r name color desc <<< "$entry"
  if gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" --force 2>/dev/null; then
    ((created++)) || true
  fi
done
echo "OK: labels ensured on $REPO (${#labels[@]} definitions)"
gh label list --repo "$REPO" --limit 200 | grep -E 'swarm:|runtime:|tier:' || true
