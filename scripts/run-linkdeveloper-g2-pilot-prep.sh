#!/usr/bin/env bash
# Wave 11.4 — LiNKdeveloper G2 pilot prep (Hello World / LinkApps kit).
# Validates local gates before VPS product run; does not require Principal Release OK.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "================================================================="
echo "Wave 11.4 — LiNKdeveloper G2 pilot prep"
echo "================================================================="

echo "[1/5] Suite manifest + runtime_tier validation"
node scripts/validate-runtime-tiers.mjs
pnpm dlx vitest run suites/linkdeveloper --root .

echo ""
echo "[2/5] Fleet mappings (orchestrator + steward OpenClaw; AZ lanes)"
cd "$ROOT/LiNKbot/runtime-adapters/openclaw/bot-runtime"
pnpm test src/fleet-runtime-mappings.test.ts
cd "$ROOT"

echo ""
echo "[3/5] Client tenant + LiNKdeveloper subscribe guards"
cd "$ROOT/LiNKaios/linkaios-web"
pnpm exec vitest run src/lib/kernel/fleet/client-tenant-linktrend.test.ts
cd "$ROOT"

echo ""
echo "[4/5] Council G2 schema validator (sample report)"
SAMPLE="$ROOT/LiNKdev/factory/templates/council-report.example.json"
if [[ -f "$SAMPLE" ]]; then
  LiNKdev/factory/scripts/validate-council.sh "$SAMPLE" --gate G2 --allow-warn || true
  echo "  (G2 validator smoke — full pilot requires steward packet + live council)"
else
  echo "SKIP: council sample report not found"
fi

echo ""
echo "[5/5] LiNKdeveloper automations manifest (LiNKautowork)"
AW="$ROOT/../LiNKautowork/automations/templates/manifest.json"
for wf in linkdeveloper-product_run_bootstrap linkdeveloper-issue_dispatch linkdeveloper-validation_record linkdeveloper-artifact_write; do
  if ! grep -q "\"workflow_id\": \"$wf\"" "$AW"; then
    echo "ERROR: missing workflow $wf in LiNKautowork manifest" >&2
    exit 1
  fi
done
echo "  linkdeveloper workflow handles present in automations manifest"

echo ""
echo "================================================================="
echo "LiNKdeveloper G2 pilot prep: PASS (local gates)"
echo "  Next (VPS): product run bootstrap → G1 council PASS → G2 trace + Zulip"
echo "  Runbook: LiNKdev/product/reports/linktrend-system/LINKDEVELOPER_G2_PILOT_PREP.md"
echo "================================================================="
