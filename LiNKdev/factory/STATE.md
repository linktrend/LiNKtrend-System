```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T01:43:59Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "none",
  "issues": {
    "LTS-001": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/kernel/LTS-001.md"
    },
    "LTS-010": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/governance/LTS-010.md"
    },
    "LTS-020": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbrain/audit/LTS-020.md"
    }
  }
}
```
