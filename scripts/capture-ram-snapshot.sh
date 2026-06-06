#!/usr/bin/env bash
# Wave 11.5 — Capture RAM snapshot (run on linkdroplet-00 via SSH or locally with RAM_SNAPSHOT_LOCAL=1).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${LINKDROPLET_00_HOST:-linkdroplet-00}"
OUT="${RAM_SNAPSHOT_DOC:-$ROOT/docs/ops/linkdroplet-00-ram-snapshot.md}"
STAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
LOAD_CTX="${RAM_LOAD_CONTEXT:-Wave 11.5 acceptance re-run}"

capture_block() {
  local host_label="$1"
  cat <<EOF

## Snapshot — ${STAMP}

**Host:** ${host_label}  
**Load context:** ${LOAD_CTX}

### free -h

\`\`\`
$(free -h 2>/dev/null || echo "free unavailable")
\`\`\`

### docker stats (snapshot)

\`\`\`
$(docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "docker stats unavailable")
\`\`\`

### peak notes (operator)

- Record peak RSS during parallel Agent Zero lanes + OpenClaw sub-agents.
- Compare against 16 GB DO minimum; Hetzner 64 GB migration is **deferred** (Wave 12).

EOF
}

if [[ "${RAM_SNAPSHOT_REMOTE:-}" == "1" ]] && command -v ssh >/dev/null 2>&1; then
  echo "Capturing RAM on ${HOST} via SSH..."
  REMOTE_BLOCK="$(ssh "$HOST" "STAMP='$STAMP' LOAD_CTX='$LOAD_CTX' bash -c '
    echo \"## Snapshot — \$STAMP\"
    echo \"\"
    echo \"**Host:** $(hostname)\"
    echo \"**Load context:** \$LOAD_CTX\"
    echo \"\"
    echo \"### free -h\"
    echo \"\`\`\`\"
    free -h
    echo \"\`\`\`\"
    echo \"\"
    echo \"### docker stats (snapshot)\"
    echo \"\`\`\`\"
    docker stats --no-stream --format \"table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}\" 2>/dev/null || echo \"(docker stats unavailable)\"
    echo \"\`\`\`\"
  '")"
  {
    echo ""
    echo "$REMOTE_BLOCK"
    echo ""
    echo "### peak notes (operator)"
    echo "- Record peak RSS during parallel Agent Zero lanes + OpenClaw sub-agents."
    echo "- Compare against 16 GB DO minimum; Hetzner 64 GB migration is **deferred** (Wave 12)."
  } >> "$OUT"
  echo "Appended remote RAM snapshot to $OUT"
  exit 0
fi

capture_block "$(hostname)" >> "$OUT"
echo "Appended RAM snapshot to $OUT"
echo "For VPS capture: RAM_SNAPSHOT_REMOTE=1 ./scripts/capture-ram-snapshot.sh"
