#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SG="$ROOT/../LiNKsuitegen"
if [[ ! -f "$SG/package.json" ]]; then
  SG="$(mktemp -d)/LiNKsuitegen"
  git clone --depth 1 -b development https://github.com/linktrend/LiNKsuitegen.git "$SG"
fi
cd "$SG"
pnpm test tests/unit/core.test.ts tests/integration/machine-review-compile.test.ts 2>/dev/null || pnpm test
test -f deploy/docker-compose.linksuitegen.yml
test -f docs/operations/DISCOVERY_CRON_POLICY.md
cd "$ROOT/LiNKbot/runtime-adapters/openclaw/bot-runtime"
pnpm test src/fleet-runtime-mappings.test.ts
echo "Wave 10 linksuitegen verification: PASS"
