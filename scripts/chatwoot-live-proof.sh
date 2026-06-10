#!/usr/bin/env bash
# Create proof Chatwoot conversations and verify LiNKaios support ticket sync inputs.
set -euo pipefail

ENV_FILE="${CHATWOOT_PROOF_ENV_FILE:-/opt/linktrend/runtime/linkaios/prod.env.runtime}"
DOCKER_NETWORK="${CHATWOOT_PROOF_DOCKER_NETWORK:-traefik}"

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

# Rails serves HTTP on :3000 inside Docker; use http for internal API calls.
BASE_URL="${CHATWOOT_BASE_URL%/}"
if [[ "$BASE_URL" == https://chatwoot-rails-1:* ]]; then
  BASE_URL="http://${BASE_URL#https://}"
fi

chatwoot_curl() {
  docker run --rm --network "$DOCKER_NETWORK" curlimages/curl:8.5.0 -fsS "$@"
}

AUTH_HEADER=( -H "api_access_token: ${CHATWOOT_API_ACCESS_TOKEN}" -H "content-type: application/json" )

echo "== Chatwoot readiness =="
chatwoot_curl "${AUTH_HEADER[@]}" "${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}" | jq -r .name
echo

create_ticket() {
  local licensee="$1"
  local subject="$2"
  local description="$3"
  local contact_name="$4"
  local source_id="${licensee}:proof:$(date +%s)-$RANDOM"
  local contact_email="support+${licensee}+${source_id}@linktrend.internal"

  local contact_json
  contact_json="$(chatwoot_curl "${AUTH_HEADER[@]}" -X POST \
    "${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts" \
    -d "$(jq -nc \
      --arg inbox "$CHATWOOT_INBOX_ID" \
      --arg name "$contact_name" \
      --arg email "$contact_email" \
      '{inbox_id: ($inbox | tonumber), name: $name, email: $email}')")"
  local contact_id
  contact_id="$(echo "$contact_json" | jq -r '.payload.contact.id // .id')"

  chatwoot_curl "${AUTH_HEADER[@]}" -X POST \
    "${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations" \
    -d "$(jq -nc \
      --arg inbox "$CHATWOOT_INBOX_ID" \
      --argjson contact "$contact_id" \
      --arg source "$source_id" \
      --arg subject "$subject" \
      --arg description "$description" \
      --arg licensee "$licensee" \
      '{
        inbox_id: ($inbox | tonumber),
        contact_id: $contact,
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
TICKET1_JSON="$(create_ticket "xyz-marketing" "Admin UI proof — billing question" "Licensee admin needs help reconciling a March invoice." "XYZ Marketing Admin")"
TICKET1_ID="$(echo "$TICKET1_JSON" | jq -r '.id')"
echo "conversation_id=${TICKET1_ID}"

echo "== Create proof ticket 2 (harbor-dental) =="
TICKET2_JSON="$(create_ticket "harbor-dental" "Admin UI proof — onboarding help" "Trial tenant cannot find the Support settings page." "Harbor Dental Admin")"
TICKET2_ID="$(echo "$TICKET2_JSON" | jq -r '.id')"
echo "conversation_id=${TICKET2_ID}"

echo "== Proof complete =="
echo "CHATWOOT_PUBLIC_URL=https://chatwoot.linktrend.internal"
echo "CHATWOOT_API_URL=${BASE_URL}"
echo "TICKET_IDS=${TICKET1_ID},${TICKET2_ID}"
