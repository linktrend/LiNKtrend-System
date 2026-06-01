```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T04:27:10.191Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "none",
  "issues": {
    "LTS-012": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-010"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/capabilities/LTS-012.md"
    },
    "LTS-021": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-020",
        "LTS-003"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbrain/librarian/LTS-021.md"
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

Archived completed issues (2026-06-01): LTS-001, LTS-010, LTS-020, LTS-002, LTS-003 (PR #69), LTS-004, LTS-005 (PR #70), LTS-011 (PR #72), LTS-060. Factory unblock PR #68 (L-014–L-016). Active wave ready for bootstrap labels: LTS-012, LTS-021, LTS-040.
