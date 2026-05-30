#!/usr/bin/env bash
# Dev Swarm mechanical verify (subset of UBS — DS-B1, B6).
set -euo pipefail

TIER="${DEV_SWARM_TIER:-standard}"
SCOPE="${DEV_SWARM_SCOPE:-dev-swarm}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

fail() { echo "VERIFY FAIL: $*" >&2; exit 1; }
ok() { echo "VERIFY OK: $*"; }

echo "== Dev Swarm verify (tier=$TIER scope=$SCOPE) =="

# 1. STATE JSON valid if present
STATE_FILE="dev-swarm/factory/STATE.md"
if [[ -f "$STATE_FILE" ]]; then
  python3 - <<'PY' "$STATE_FILE" || fail "STATE.md JSON invalid"
import json, re, sys
text = open(sys.argv[1]).read()
m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.S)
if not m:
    sys.exit("no json block")
json.loads(m.group(1))
print("state json ok")
PY
fi

# 2. Secret patterns in scope (staged + scope tree)
SECRET_PAT='(api[_-]?key|secret|password|private[_-]?key)\s*=\s*["\x27][^"\x27]{8,}'
if rg -i "$SECRET_PAT" "$SCOPE" --glob '!.env' --glob '!*.example' 2>/dev/null; then
  fail "possible secret assignment in $SCOPE"
fi
ok "no obvious secret assignments in $SCOPE"

# 3. Scripts executable and shellcheck if available
for s in dev-swarm/factory/scripts/*.sh; do
  [[ -f "$s" ]] || continue
  [[ -x "$s" ]] || fail "$s not executable"
  if command -v shellcheck >/dev/null 2>&1; then
    shellcheck -x "$s" || fail "shellcheck $s"
  fi
done
ok "scripts present"

# 4. JSON schemas parse
for j in dev-swarm/factory/contracts/*.json dev-swarm/factory/gates/catalog.json; do
  [[ -f "$j" ]] || continue
  python3 -c "import json; json.load(open('$j'))" || fail "invalid json $j"
done
ok "contracts json valid"

# 5. Critical tier extras
if [[ "$TIER" == "critical" ]]; then
  if ! dev-swarm/factory/scripts/validate-dag.sh dev-swarm/factory/programs/bootstrap/PROGRAM.md 2>/dev/null; then
    fail "DAG validation failed (critical tier)"
  fi
  ok "critical: DAG re-validated"
fi

echo "== verify passed =="

# Optional tier-A gates (package B) — skip when invoked from run-gates verify_subset
if [[ "${DEV_SWARM_SKIP_GATES:-}" != "1" ]]; then
  if [[ -n "${DEV_SWARM_RUN_GATES:-}" ]] || [[ "$TIER" == "standard" ]]; then
    GATE_ARGS=(--tier A --scope "$SCOPE")
    [[ -n "${DEV_SWARM_REPORT:-}" ]] && GATE_ARGS+=(--report "$DEV_SWARM_REPORT")
    [[ -n "${DEV_SWARM_PROGRAM:-}" ]] && GATE_ARGS+=(--program "$DEV_SWARM_PROGRAM")
    if ! dev-swarm/factory/scripts/run-gates.sh "${GATE_ARGS[@]}"; then
      fail "tier A gates failed"
    fi
    ok "tier A gates passed"
  fi
fi

exit 0
