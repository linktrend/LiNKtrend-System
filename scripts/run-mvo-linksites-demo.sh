#!/usr/bin/env bash
# MVO LinkSites demo — reproducible proof without Principal walkthrough.
# Principal D1 B mock lead + D2 A draft outreach; publish uses Payload mock/shadow when live env absent.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export LINKAUTOWORK_MVO_MODE="${LINKAUTOWORK_MVO_MODE:-mock}"

echo "================================================================="
echo "LinkSites MVO demo harness (LTS-108)"
echo "================================================================="
echo ""

echo "[1/4] Suite phase unit tests (seven-step spine modules)"
pnpm dlx vitest run suites/linksites --root .

echo ""
echo "[2/4] LiNKautowork LinkSites v2 workflows (fail-closed + MVO mock chain)"
cd LiNKautowork/gateway
npm test -- src/workflows/linksites-v2.test.ts
cd "$ROOT"

echo ""
echo "[3/4] LiNKdev verify (LinkSites scope)"
LINKDEV_SCOPE=suites/linksites LiNKdev/factory/scripts/verify.sh

echo ""
echo "[4/4] Kernel E2E (optional — requires local Supabase + BOT_KERNEL_API_SECRET)"
if [[ -n "${BOT_KERNEL_API_SECRET:-}" ]] && [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]] && [[ -n "${SUPABASE_SECRET_KEY:-}" ]]; then
  pnpm exec tsx scripts/run-e2e.ts
else
  echo "SKIP: set BOT_KERNEL_API_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY for live kernel E2E"
fi

MANIFEST_PATH="${MVO_LATEST_RUN_PATH:-LiNKdev/product/reports/linktrend-system/mvo-latest-run.json}"
if [[ -f "$MANIFEST_PATH" ]]; then
  echo ""
  echo "Latest MVO manifest: $MANIFEST_PATH"
  echo "  Open Client proof with persisted run IDs after starting linkaios-web."
fi

echo ""
echo "================================================================="
echo "MVO UI surfaces (start linkaios-web dev server first)"
echo "================================================================="
echo "  Client MVO proof: http://localhost:3000/devtools/mvo-proof"
echo "  Admin MVO proof:  http://localhost:3000/admin/devtools/mvo-proof"
echo "  Temp URL pattern: https://{business-slug}.linktrend.media (MVO equivalent when Payload mock)"
echo "================================================================="
