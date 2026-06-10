#!/usr/bin/env bash
# Create proof Chatwoot conversations and verify LiNKaios support ticket sync inputs.
set -euo pipefail

ENV_FILE="${CHATWOOT_PROOF_ENV_FILE:-/opt/linktrend/runtime/linkaios/prod.env.runtime}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing runtime env: $ENV_FILE"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

: "${CHATWOOT_BASE_URL:?CHATWOOT_BASE_URL required}"
: "${CHATWOOT_ACCOUNT_ID:?CHATWOOT_ACCOUNT_ID required}"
: "${CHATWOOT_API_ACCESS_TOKEN:?CHATWOOT_API_ACCESS_TOKEN required}"
: "${CHATWOOT_INBOX_ID:?CHATWOOT_INBOX_ID required}"

if [[ "${CHATWOOT_SUPPORT_SYNC_MODE:-off}" != "live" ]]; then
  echo "CHATWOOT_SUPPORT_SYNC_MODE must be live (got ${CHATWOOT_SUPPORT_SYNC_MODE:-unset})"
  exit 1
fi

BASE_URL="${CHATWOOT_BASE_URL%/}"
AUTH_HEADER=( -H "api_access_token: ${CHATWOOT_API_ACCESS_TOKEN}" -H "content-type: application/json" )
CURL=(curl -fsS)
if [[ -n "${CHATWOOT_TLS_INSECURE:-}" && "${CHATWOOT_TLS_INSECURE}" != "0" ]]; then
  CURL+=(-k)
fi

echo "== Chatwoot readiness =="
"${CURL[@]}" "${AUTH_HEADER[@]}" "${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}" | head -c 200
echo

create_ticket() {
  local licensee="$1"
  local subject="$2"
  local description="$3"
  local source_id="${licensee}:proof:$(date +%s)-$RANDOM"

  "${CURL[@]}" "${AUTH_HEADER[@]}" -X POST \
    "${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations" \
    -d "$(jq -nc \
      --arg inbox "$CHATWOOT_INBOX_ID" \
      --arg source "$source_id" \
      --arg subject "$subject" \
      --arg description "$description" \
      --arg licensee "$licensee" \
      '{
        inbox_id: ($inbox | tonumber),
        source_id: $source,
        status: "open",
        message: { content: ($subject + "\n\n" + $description) },
        custom_attributes: {
          licensee_id: $licensee,
          subject: $subject,
          page_path: "/customer-service"
        }
      }')"
}

echo "== Create proof ticket 1 (xyz-marketing) =="
TICKET1_JSON="$(create_ticket "xyz-marketing" "Admin UI proof — billing question" "Licensee admin needs help reconciling a March invoice.")"
TICKET1_ID="$(echo "$TICKET1_JSON" | jq -r '.id')"
echo "conversation_id=${TICKET1_ID}"

echo "== Create proof ticket 2 (harbor-dental) =="
TICKET2_JSON="$(create_ticket "harbor-dental" "Admin UI proof — onboarding help" "Trial tenant cannot find the Support settings page.")"
TICKET2_ID="$(echo "$TICKET2_JSON" | jq -r '.id')"
echo "conversation_id=${TICKET2_ID}"

echo "== Proof complete =="
echo "CHATWOOT_URL=${BASE_URL}"
echo "TICKET_IDS=${TICKET1_ID},${TICKET2_ID}"
