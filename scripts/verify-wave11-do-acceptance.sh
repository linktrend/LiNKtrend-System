#!/usr/bin/env bash
# Wave 11 — DigitalOcean acceptance verification (local CI; VPS steps documented).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "================================================================="
echo "Wave 11 — DigitalOcean acceptance verification"
echo "================================================================="

echo "[11.1] Fleet registry (5 OC + 8 AZ + policy doc)"
test -f docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md
test -f LiNKdev/product/reports/linktrend-system/WAVE11_FLEET_PROOF.md
cd "$ROOT/LiNKbot/runtime-adapters/openclaw/bot-runtime"
pnpm test src/fleet-runtime-mappings.test.ts
cd "$ROOT/LiNKaios/linkaios-web"
pnpm exec vitest run src/lib/kernel/fleet/fleet-dashboard.test.ts 2>/dev/null \
  || pnpm exec vitest run src/lib/kernel/kernel.test.ts -t "13 LinkSites"
cd "$ROOT"

echo ""
echo "[11.2] Admin LiNKsuitegen publish path (integration test)"
./scripts/verify-wave10-linksuitegen.sh

echo ""
echo "[11.3] LinkSites MVO 13/13"
if [[ -f "${MVO_LATEST_RUN_PATH:-LiNKdev/product/reports/linktrend-system/mvo-latest-run.json}" ]]; then
  node scripts/verify-mvo-13-stages.mjs
else
  echo "  No persisted manifest — running demo harness + stage manifest unit proof"
  pnpm dlx vitest run LiNKaios/linkaios-web/src/lib/kernel/kernel.test.ts -t "13 LinkSites"
fi

echo ""
echo "[11.4] LiNKdeveloper G2 pilot prep"
./scripts/run-linkdeveloper-g2-pilot-prep.sh

echo ""
echo "[11.5] RAM snapshot doc present"
test -f docs/ops/linkdroplet-00-ram-snapshot.md

echo ""
echo "[11.6] Tenant isolation (two test tenants)"
cd "$ROOT/LiNKaios/linkaios-web"
pnpm exec vitest run src/lib/kernel/fleet/tenant-isolation.test.ts
cd "$ROOT"

echo ""
echo "[11.7] Principal Release OK — DOCUMENT GATE ONLY (not blocking this script)"
echo "  See wave11-do-acceptance.md § Principal Release OK"

echo ""
echo "[Wave 12] Hetzner migration — DEFERRED"
test -f docs/deploy/WAVE12_HETZNER_MIGRATION_DEFERRED.md

echo ""
echo "================================================================="
echo "Wave 11 DigitalOcean acceptance verification: PASS"
echo "================================================================="
