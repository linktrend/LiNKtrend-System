#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/LiNKaios/linkaios-web"
pnpm exec vitest run src/lib/kernel/fleet/client-tenant-linktrend.test.ts src/lib/admin/linksuitegen/admin-integration.test.ts -t "linktrend client"
echo "Wave 7 client verification: PASS"
