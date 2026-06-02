#!/usr/bin/env bash
# Area 7 — LinkSites MVO live: Payload publish + kernel E2E with traces in LiNKaios.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LINKSITES_ROOT="${LINKSITES_ROOT:-/Users/linktrend/Projects/LiNKsites}"

cd "$ROOT"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

fetch_gsm() {
  local name="$1"
  gcloud secrets versions access latest --secret="$name" 2>/dev/null || true
}

export DATABASE_URI="${DATABASE_URI:-$(fetch_gsm LINKSITES_CMS_DATABASE_URI)}"
export PAYLOAD_SECRET="${PAYLOAD_SECRET:-$(fetch_gsm LINKSITES_CMS_PAYLOAD_SECRET)}"
export LINKAUTOWORK_PAYLOAD_BASE_URL="${LINKAUTOWORK_PAYLOAD_BASE_URL:-https://cms.linktrend.internal}"
export LINKAUTOWORK_PAYLOAD_READINESS_COLLECTION="${LINKAUTOWORK_PAYLOAD_READINESS_COLLECTION:-pages}"
export LINKAUTOWORK_MVO_MODE="${LINKAUTOWORK_MVO_MODE:-live}"
export LINKAUTOWORK_DISPATCH_MODE="${LINKAUTOWORK_DISPATCH_MODE:-live}"
export LINKAIOS_UI_MOCKS="${LINKAIOS_UI_MOCKS:-0}"
export MVO_LIVE_RUN="${MVO_LIVE_RUN:-1}"
export LINKSKILLS_EXECUTION_GATE="${LINKSKILLS_EXECUTION_GATE:-permissive}"
export LINKAUTOWORK_ARTIFACT_ROOT="${LINKAUTOWORK_ARTIFACT_ROOT:-/tmp/linksites-artifacts}"
export MVO_LIVE_PUBLISH_PATH="${MVO_LIVE_PUBLISH_PATH:-$ROOT/LiNKdev/product/reports/linktrend-system/mvo-live-publish.json}"
export MVO_LIVE_PUBLISH_JSON=""
export MVO_E2E_TENANT_ID="${MVO_E2E_TENANT_ID:-${CALUSA_TENANT_ID:-e976eb75-1aff-4ca1-ad0d-5c940c343434}}"
export MVO_LIVE_RUN="${MVO_LIVE_RUN:-1}"

echo "================================================================="
echo "LinkSites MVO LIVE (Area 7)"
echo "================================================================="

if [[ -z "${DATABASE_URI}" ]] || [[ -z "${PAYLOAD_SECRET}" ]]; then
  echo "ERROR: DATABASE_URI and PAYLOAD_SECRET required (GSM or env)." >&2
  exit 1
fi

echo "[1/3] Live Payload publish (LiNKsites)"
cd "$LINKSITES_ROOT"
chmod +x scripts/mvo-live-publish.sh
./scripts/mvo-live-publish.sh
cd "$ROOT"
export MVO_LIVE_PUBLISH_PATH
export MVO_LIVE_PUBLISH_JSON="$(cat "$MVO_LIVE_PUBLISH_PATH")"

echo ""
echo "[2/3] Build autowork-gateway + linklogic-sdk"
pnpm --filter @linktrend/linklogic-sdk build
pnpm --filter @linktrend/autowork-gateway build

echo ""
echo "[3/3] Kernel E2E (Supabase + BOT_KERNEL_API_SECRET)"
if [[ -z "${BOT_KERNEL_API_SECRET:-}" ]] || [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]] || [[ -z "${SUPABASE_SECRET_KEY:-}" ]]; then
  echo "ERROR: Set BOT_KERNEL_API_SECRET, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY in $ROOT/.env" >&2
  exit 1
fi

export LINKAIOS_ENABLE_MVO_SERVICE_BYPASS="${LINKAIOS_ENABLE_MVO_SERVICE_BYPASS:-true}"
pnpm exec tsx scripts/run-e2e.ts

echo ""
echo "Live publish artifact: $MVO_LIVE_PUBLISH_PATH"
echo "MVO manifest: LiNKdev/product/reports/linktrend-system/mvo-latest-run.json"
