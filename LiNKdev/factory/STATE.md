```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T05:25:36.607Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "none",
  "issues": {
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

Wave 5 active (2026-06-01): LTS-013 and LTS-040 ready for Cursor dispatch. LTS-030 remains blocked by LTS-013; LTS-050 remains blocked by LTS-040. Wave 4 complete: LTS-012 PR #80 merged — studio Zulip + Plane default capabilities. Wave 3 complete: LTS-003 PR #69, LTS-005 PR #70, LTS-011 PR #72. Earlier dependency completions include LTS-001, LTS-010, LTS-020, LTS-002, LTS-004, and LTS-060.
