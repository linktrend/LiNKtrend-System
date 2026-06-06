#!/usr/bin/env bash
# Wave 11.3 — LinkSites MVO acceptance re-run on DigitalOcean (or local with env).
# Chooses live harness when Supabase + Payload secrets present; otherwise demo + manifest check.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MANIFEST_PATH="${MVO_LATEST_RUN_PATH:-LiNKdev/product/reports/linktrend-system/mvo-latest-run.json}"

echo "================================================================="
echo "Wave 11.3 — LinkSites MVO acceptance re-run"
echo "================================================================="

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

has_live_env=false
if [[ -n "${BOT_KERNEL_API_SECRET:-}" ]] \
  && [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]] \
  && [[ -n "${SUPABASE_SECRET_KEY:-}" ]]; then
  has_live_env=true
fi

if [[ "${MVO_ACCEPTANCE_MODE:-}" == "live" ]] || { [[ "${MVO_ACCEPTANCE_MODE:-}" != "demo" ]] && $has_live_env; }; then
  echo "Mode: LIVE (kernel E2E + optional Payload publish)"
  ./scripts/run-mvo-linksites-live.sh
else
  echo "Mode: DEMO (unit + workflow tests; kernel E2E if Supabase env present)"
  ./scripts/run-mvo-linksites-demo.sh
fi

echo ""
echo "Verifying 13/13 kernel stages in manifest..."
node scripts/verify-mvo-13-stages.mjs "$MANIFEST_PATH"

echo ""
echo "================================================================="
echo "LinkSites MVO acceptance: PASS (13/13)"
echo "  Manifest: $MANIFEST_PATH"
echo "  UI proof:  /devtools/mvo-proof (linkaios-web)"
echo "================================================================="
