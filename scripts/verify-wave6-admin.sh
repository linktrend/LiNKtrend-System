#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/LiNKaios/linkaios-web"
export LINKSUITEGEN_ADMIN_STORE_MODE=memory
pnpm exec vitest run src/lib/admin/linksuitegen/admin-integration.test.ts src/lib/admin/fleet-dashboard.ts
echo "Wave 6 admin verification: PASS"
