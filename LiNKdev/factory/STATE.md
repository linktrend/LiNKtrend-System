```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T03:25:00Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "none",
  "issues": {
    "LTS-002": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-002.md"
    },
    "LTS-004": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-004.md"
    },
    "LTS-060": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/LTS-060.md"
    }
  }
}
```

Wave 1 complete (2026-06-01): LTS-001 merged PR #55 + Supabase migrations applied; LTS-010 PR #49; LTS-020 PR #50. Active wave 2 cap 3: LTS-002, LTS-004, LTS-060.
