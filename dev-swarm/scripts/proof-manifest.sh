#!/usr/bin/env bash
# Emit light proof manifest (DS-B7) from an agent report directory.
set -euo pipefail

REPORT="${1:-}"
OUT="${2:-dev-swarm/reports/proof-manifest.json}"
if [[ -z "$REPORT" || ! -f "$REPORT" ]]; then
  echo "usage: proof-manifest.sh <report.md> [out.json]" >&2
  exit 2
fi

python3 - <<'PY' "$REPORT" "$OUT"
import hashlib, json, re, sys
from pathlib import Path

report = Path(sys.argv[1])
out = Path(sys.argv[2])
text = report.read_text()
artifacts = []
for m in re.finditer(r"artifact_path[\"']?\s*:\s*[\"']([^\"']+)[\"']", text):
    p = Path(m.group(1))
    if p.is_file():
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        artifacts.append({"path": str(p), "sha256": h})
manifest = {
    "report": str(report),
    "artifact_count": len(artifacts),
    "artifacts": artifacts,
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(manifest, indent=2) + "\n")
print(f"wrote {out} ({len(artifacts)} artifacts)")
PY
