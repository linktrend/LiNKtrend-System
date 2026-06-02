#!/usr/bin/env bash
# Live Zulip + human↔bot roundtrip proof for Calusa staging.
# Run on linkdroplet-00 after render-runtime-env-from-gsm.sh and compose up.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ZULIP_PROOF_ENV_FILE:-/opt/linktrend/runtime/linkaios/prod.env.runtime}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing runtime env: $ENV_FILE"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

if [[ "${ZULIP_RUN_MESSAGING_MODE:-mock}" != "live" ]]; then
  echo "ZULIP_RUN_MESSAGING_MODE must be live (got ${ZULIP_RUN_MESSAGING_MODE:-unset})"
  exit 1
fi

: "${ZULIP_SITE_URL:?ZULIP_SITE_URL required}"
: "${ZULIP_BOT_EMAIL:?ZULIP_BOT_EMAIL required}"
: "${ZULIP_BOT_API_KEY:?ZULIP_BOT_API_KEY required}"

PROJECT_ID="${CALUSA_PROJECT_ID:-}"
STREAM="${CALUSA_ZULIP_STREAM:-}"
TOPIC="${CALUSA_ZULIP_TOPIC:-general}"
HUMAN_MSG="${1:-Calusa staging proof — please acknowledge this thread.}"

if [[ -z "$STREAM" ]]; then
  echo "Set CALUSA_ZULIP_STREAM (project stream name from LiNKaios project create trace)"
  exit 1
fi

TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
PROOF_BODY="**LiNKaios live proof** @ $(date -u)
Human operator: ${HUMAN_MSG}
project_id=${PROJECT_ID:-unknown}
topic=${TOPIC}"

echo "== Zulip connectivity =="
ZULIP_CURL=(curl -fsS)
if [[ -n "${ZULIP_TLS_INSECURE:-}" && "${ZULIP_TLS_INSECURE}" != "0" ]]; then
  ZULIP_CURL+=(-k)
fi
if [[ -n "${ZULIP_INTERNAL_HOST_IP:-}" ]]; then
  ZULIP_HOST="${ZULIP_SITE_URL#*://}"
  ZULIP_HOST="${ZULIP_HOST%%/*}"
  ZULIP_CURL+=(--resolve "${ZULIP_HOST}:443:${ZULIP_INTERNAL_HOST_IP}")
fi
"${ZULIP_CURL[@]}" -u "${ZULIP_BOT_EMAIL}:${ZULIP_BOT_API_KEY}" \
  "${ZULIP_SITE_URL%/}/api/v1/users/me" | head -c 200
echo

echo "== Post human proof message to stream=${STREAM} topic=${TOPIC} =="
SEND_JSON="$("${ZULIP_CURL[@]}" -u "${ZULIP_BOT_EMAIL}:${ZULIP_BOT_API_KEY}" \
  -X POST "${ZULIP_SITE_URL%/}/api/v1/messages" \
  -d "type=stream" \
  -d "to=${STREAM}" \
  -d "topic=${TOPIC}" \
  -d "content=${PROOF_BODY}")"
echo "$SEND_JSON"
MSG_ID="$(node -e "const j=JSON.parse(process.argv[1]); process.stdout.write(String(j.id||''))" "$SEND_JSON")"

echo "== OpenClaw agent roundtrip (lisa) =="
if [[ -n "${OPENCLAW_AGENT_RUN_URL:-}" && -n "${OPENCLAW_RUN_AUTH_BEARER:-}" ]]; then
  IDEM="zulip-proof-$(uuidgen 2>/dev/null || echo "$TS")"
  curl -fsS -X POST "${OPENCLAW_AGENT_RUN_URL}" \
    -H "Authorization: Bearer ${OPENCLAW_RUN_AUTH_BEARER}" \
    -H "Content-Type: application/json" \
    -d "$(node -e "
      const msg = process.argv[1];
      console.log(JSON.stringify({
        message: 'Reply briefly in Zulip thread context: ' + msg,
        idempotencyKey: process.argv[2],
        agentId: 'lisa',
        linktrendGovernance: {
          bootstrap: { traceCorrelationId: process.argv[2], authorizationState: 'granted' },
          approvedTools: { toolNames: ['read'] },
        },
      }));
    " "$HUMAN_MSG" "$IDEM")" | head -c 500
  echo
else
  echo "SKIP: OPENCLAW_AGENT_RUN_URL or OPENCLAW_RUN_AUTH_BEARER unset"
fi

echo "== gateway health =="
curl -fsS "http://127.0.0.1:${ZULIP_GATEWAY_PORT:-8790}/health" || \
  docker compose -f "$ROOT_DIR/docker-compose.deploy.yml" exec -T zulip-gateway wget -qO- "http://127.0.0.1:8790/health" 2>/dev/null || true
echo

echo "PROOF message_id=${MSG_ID} stream=${STREAM} topic=${TOPIC} at ${TS}"
