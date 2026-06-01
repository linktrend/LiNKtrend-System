```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T06:00:00.000Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "none",
  "issues": {
    "LTS-002": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-002.md"
    },
    "LTS-003": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-002"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-003.md",
      "last_pr": 69,
      "done_at": "2026-06-01T04:22:37.408Z"
    },
    "LTS-004": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-004.md"
    },
    "LTS-005": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-004"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-005.md",
      "last_pr": 70,
      "done_at": "2026-06-01T04:22:49.758Z"
    },
    "LTS-011": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-010"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/governance/LTS-011.md",
      "last_pr": 72,
      "done_at": "2026-06-01T04:23:02.786Z"
    },
    "LTS-012": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-010"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/capabilities/LTS-012.md",
      "last_pr": 80,
      "done_at": "2026-06-01T05:22:21.187Z"
    },
    "LTS-060": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/LTS-060.md"
    },
    "LTS-013": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-012"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/capabilities/LTS-013.md"
    },
    "LTS-040": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-011",
        "LTS-020"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-040.md"
    }
  }
}
```

Wave 5 active (2026-06-01): LTS-013, LTS-040 — break-glass advance after cloud orchestrator (#81) failed to apply labels. Wave 4 complete: LTS-012 PR #80.
