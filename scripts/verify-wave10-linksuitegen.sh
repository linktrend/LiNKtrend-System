#!/usr/bin/env bash
# Wave 10 / 11.2 — LiNKsuitegen Admin publish path (LiNKaios integration + optional external factory tests).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SG="${LINKSUITEGEN_ROOT:-$ROOT/../LiNKsuitegen}"

resolve_suitegen_deploy() {
  if [[ -f "$SG/deploy/docker-compose.linksuitegen.yml" ]]; then
    echo "$SG"
    return
  fi
  local tmp
  tmp="$(mktemp -d)/LiNKsuitegen"
  if git clone --depth 1 -b development https://github.com/linktrend/LiNKsuitegen.git "$tmp" 2>/dev/null \
    && [[ -f "$tmp/deploy/docker-compose.linksuitegen.yml" ]]; then
    echo "$tmp"
    return
  fi
  echo ""
}

SG_PATH="$(resolve_suitegen_deploy)"
if [[ -n "$SG_PATH" ]]; then
  test -f "$SG_PATH/deploy/docker-compose.linksuitegen.yml"
  test -f "$SG_PATH/docs/operations/DISCOVERY_CRON_POLICY.md"
  echo "  LiNKsuitegen deploy artefacts: OK ($SG_PATH)"
  if [[ -f "$SG_PATH/package.json" ]]; then
    cd "$SG_PATH"
    pnpm test tests/unit/core.test.ts tests/integration/machine-review-compile.test.ts 2>/dev/null || pnpm test
    cd "$ROOT"
  else
    echo "  SKIP: LiNKsuitegen tests (no package.json) — LiNKaios admin integration is canonical proof"
  fi
else
  echo "  WARN: LiNKsuitegen deploy checkout unavailable — LiNKaios admin integration is canonical proof"
fi

echo "[11.2] Admin handoff → publish (LiNKaios)"
cd "$ROOT/LiNKaios/linkaios-web"
pnpm exec vitest run src/lib/admin/linksuitegen/admin-integration.test.ts
cd "$ROOT"

cd "$ROOT/LiNKbot/runtime-adapters/openclaw/bot-runtime"
pnpm test src/fleet-runtime-mappings.test.ts
echo "Wave 10 linksuitegen verification: PASS"
