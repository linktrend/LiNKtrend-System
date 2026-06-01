```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T04:14:43Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "none",
  "issues": {
    "LTS-002": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-002.md"
    },
    "LTS-003": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-002"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-003.md"
    },
    "LTS-004": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-004.md"
    },
    "LTS-005": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-004"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-005.md"
    },
    "LTS-011": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-010"],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/governance/LTS-011.md"
    },
    "LTS-060": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/suite-map/LTS-060.md",
      "last_commit": "2599ec98741bac3f88ac0663503934bb5aeae5c5"
    }
  }
}
```

Wave 2 complete (2026-06-01): LTS-002 merged PR #57; LTS-004 merged PR #58; LTS-060 merged PR #56. Pipeline unblock PR #59 landed (L-009/L-010). Active wave 3 cap 3: LTS-003, LTS-005, LTS-011.
