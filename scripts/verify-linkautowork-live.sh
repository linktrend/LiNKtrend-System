#!/usr/bin/env bash
# Area 4 proof: LiNKautowork gateway health + optional n8n webhook smoke.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

N8N_BASE_URL="${N8N_BASE_URL:-https://n8n.linktrend.internal}"
LINKAIOS_BASE="${LINKAIOS_BASE_URL:-https://linkaios.linktrend.internal}"
HANDLE="${VERIFY_WORKFLOW_HANDLE:-autowork.linksites.preview_readiness_check}"
WEBHOOK_PATH="${HANDLE#autowork.}"
WEBHOOK_PATH="${WEBHOOK_PATH//./-}"
TENANT_ID="${VERIFY_TENANT_ID:-00000000-0000-0000-0000-000000000001}"
RUN_ID="verify-$(date +%s)"
IDEM="${RUN_ID}:${HANDLE}"

echo "== LiNKautowork / n8n live verification =="
echo "n8n base: ${N8N_BASE_URL}"
echo "linkaios base: ${LINKAIOS_BASE}"
echo "handle: ${HANDLE}"
echo "webhook path: /webhook/${WEBHOOK_PATH}"

if [[ -n "${N8N_API_KEY:-}" ]]; then
  echo "--- n8n workflows (API) ---"
  curl -fsS -H "x-n8n-api-key: ${N8N_API_KEY}" \
    "${N8N_BASE_URL}/api/v1/workflows?limit=50" | head -c 2000 || true
  echo ""
fi

if [[ -n "${LINKAUTOWORK_INVOKE_SECRET:-}" ]]; then
  echo "--- direct invoke (LiNKaios internal) ---"
  BODY=$(cat <<EOF
{
  "tenant_id": "${TENANT_ID}",
  "run_id": "${RUN_ID}",
  "stage_id": "preview_readiness_check",
  "workflow_handle": "${HANDLE}",
  "inputs": {
    "payload_sync_ref": "payload_sync:verify",
    "preview_url": "https://demo.linktrend.media",
    "required_pages": ["home"]
  },
  "idempotency_key": "${IDEM}"
}
EOF
)
  curl -fsS -X POST "${LINKAIOS_BASE}/api/internal/autowork/workflows/invoke" \
    -H "content-type: application/json" \
    -H "x-linkautowork-invoke-secret: ${LINKAUTOWORK_INVOKE_SECRET}" \
    -d "${BODY}" | tee /tmp/linkautowork-invoke-proof.json
  echo ""
fi

if [[ "${VERIFY_N8N_WEBHOOK:-0}" == "1" ]]; then
  echo "--- n8n webhook POST ---"
  curl -fsS -X POST "${N8N_BASE_URL}/webhook/${WEBHOOK_PATH}" \
    -H "content-type: application/json" \
    -d "{\"tenant_id\":\"${TENANT_ID}\",\"run_id\":\"${RUN_ID}\",\"stage_id\":\"preview_readiness_check\",\"workflow_handle\":\"${HANDLE}\",\"inputs\":{\"payload_sync_ref\":\"payload_sync:verify\",\"preview_url\":\"https://demo.linktrend.media\",\"required_pages\":[\"home\"]},\"idempotency_key\":\"${IDEM}\"}" \
    | tee /tmp/linkautowork-n8n-proof.json
  echo ""
fi

echo "VERIFY OK (see /tmp/linkautowork-*-proof.json when secrets were set)"
