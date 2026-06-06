#!/usr/bin/env bash
# Wave 9 verification — LinkSites production deliverables (local).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> LinkSites outreach phase tests"
pnpm dlx vitest run suites/linksites/phases/outreach --root .

echo "==> Bot-runtime mission outreach governance"
pnpm dlx vitest run LiNKbot/runtime-adapters/openclaw/bot-runtime/src/mission.test.ts --root .

echo "==> LiNKautowork outreach_dispatch workflow"
cd LiNKautowork/gateway
npm test -- src/workflows/linksites-v2.test.ts
cd "$ROOT"

if [ -f "LiNKbot/runtime-adapters/openclaw/bot-runtime/src/suite-role-openclaw.test.ts" ]; then
  echo "==> LinkSites fleet mapping (linksites-head)"
  pnpm dlx vitest run LiNKbot/runtime-adapters/openclaw/bot-runtime/src/suite-role-openclaw.test.ts --root .
elif [ -f "scripts/validate-runtime-tiers.mjs" ]; then
  echo "==> Runtime tier validation"
  node scripts/validate-runtime-tiers.mjs
else
  echo "==> Skipping fleet mapping check (Wave 5 dependency not on branch)"
fi

echo "Wave 9 local verification passed."
