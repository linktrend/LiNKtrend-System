```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T06:43:03.000Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "none",
  "issues": {
    "LTS-001": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/kernel/LTS-001.md",
      "last_pr": 20,
      "done_at": "2026-06-01T01:00:00.000Z"
    },
    "LTS-002": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-002.md",
      "last_pr": 18,
      "done_at": "2026-06-01T04:00:00.000Z"
    },
    "LTS-003": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-002"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-003.md",
      "last_pr": 69,
      "done_at": "2026-06-01T04:22:37.408Z"
    },
    "LTS-004": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-004.md",
      "last_pr": 58,
      "done_at": "2026-06-01T03:52:54.000Z"
    },
    "LTS-005": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-004"],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-005.md",
      "last_pr": 70,
      "done_at": "2026-06-01T04:22:49.758Z"
    },
    "LTS-010": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/governance/LTS-010.md",
      "last_pr": 44,
      "done_at": "2026-06-01T01:00:00.000Z"
    },
    "LTS-011": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-010"],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/governance/LTS-011.md",
      "last_pr": 72,
      "done_at": "2026-06-01T04:23:02.786Z"
    },
    "LTS-012": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-010"],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/capabilities/LTS-012.md",
      "last_pr": 80,
      "done_at": "2026-06-01T05:22:21.187Z"
    },
    "LTS-013": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-012"],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/capabilities/LTS-013.md",
      "last_pr": 85,
      "done_at": "2026-06-01T05:49:00.000Z"
    },
    "LTS-020": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linkbrain/audit/LTS-020.md",
      "last_pr": 50,
      "done_at": "2026-06-01T01:00:00.000Z"
    },
    "LTS-021": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-020", "LTS-003"],
      "report": "LiNKdev/product/reports/linktrend-system/linkbrain/librarian/LTS-021.md",
      "last_pr": 89,
      "done_at": "2026-06-01T14:00:00.000Z"
    },
    "LTS-030": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-013", "LTS-020"],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-030.md",
      "last_pr": 87,
      "done_at": "2026-06-01T14:00:00.000Z"
    },
    "LTS-031": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-030"],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-031.md",
      "last_pr": 90,
      "done_at": "2026-06-01T14:05:00.000Z"
    },
    "LTS-032": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-031"],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-032.md",
      "last_pr": 93,
      "done_at": "2026-06-01T14:08:00.000Z"
    },
    "LTS-033": {
      "status": "ready",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-032"],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-033.md",
      "notes": "Reset 2026-06-01: batch-marked done in PR #95 without linkdev:done or passing build-test"
    },
    "LTS-034": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-033"],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-034.md",
      "notes": "Reset 2026-06-01: PR #95 theater — needs proper executor/reviewer/integrator cycle"
    },
    "LTS-040": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-011", "LTS-020"],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-040.md",
      "last_pr": 84,
      "done_at": "2026-06-01T05:48:00.000Z"
    },
    "LTS-041": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-040"],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-041.md",
      "last_pr": 91,
      "done_at": "2026-06-01T14:05:00.000Z"
    },
    "LTS-042": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-041", "LTS-013"],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-042.md",
      "last_pr": 93,
      "done_at": "2026-06-01T14:08:00.000Z"
    },
    "LTS-043": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-034", "LTS-042"],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-043.md",
      "notes": "Reset 2026-06-01: PR #95 batch without gates"
    },
    "LTS-050": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-011", "LTS-040"],
      "report": "LiNKdev/product/reports/linktrend-system/linkguard/security/LTS-050.md",
      "last_pr": 88,
      "done_at": "2026-06-01T14:00:00.000Z"
    },
    "LTS-060": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-001"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/LTS-060.md",
      "last_pr": 39,
      "done_at": "2026-06-01T03:00:00.000Z"
    },
    "LTS-101": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-060", "LTS-040", "LTS-002"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/lead-generation/LTS-101.md",
      "last_pr": 92,
      "done_at": "2026-06-01T14:06:00.000Z"
    },
    "LTS-102": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-101", "LTS-041"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/qualification/LTS-102.md",
      "last_pr": 93,
      "done_at": "2026-06-01T14:08:00.000Z"
    },
    "LTS-103": {
      "status": "done",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-102", "LTS-042"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/template-selection/LTS-103.md",
      "last_pr": 100,
      "done_at": "2026-06-01T06:39:06.000Z"
    },
    "LTS-104": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-103", "LTS-030"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/website-build/LTS-104.md",
      "notes": "Blocked 2026-06-01: LTS-103 merged, but G3/tier-B gates are not passable yet (missing G3 council-report.json; local deps absent for integration smoke/typecheck)"
    },
    "LTS-105": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-104", "LTS-032", "LTS-033"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/publish/LTS-105.md",
      "notes": "Reset 2026-06-01: PR #95 stub — publish not operational"
    },
    "LTS-106": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-105", "LTS-043"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/outreach/LTS-106.md",
      "notes": "Reset 2026-06-01: PR #95 stub"
    },
    "LTS-107": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-106"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/close-recycle/LTS-107.md",
      "notes": "Reset 2026-06-01: PR #95 stub"
    },
    "LTS-108": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": ["LTS-107", "LTS-003", "LTS-005", "LTS-012"],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/e2e-proof/LTS-108.md",
      "notes": "Reset 2026-06-01: no demo recorded; SHIP_CRITERIA §2 unchecked"
    },
    "LTS-900": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "critical",
      "depends_on": ["LTS-108"],
      "report": "LiNKdev/product/reports/linktrend-system/release/ship/LTS-900.md",
      "notes": "Reset 2026-06-01: release blocked until MVO genuinely complete"
    }
  }
}
```

Waves 1–8: individual PRs with linkdev:done (#18–#93). **Reset 2026-06-01:** PR #95 falsely marked waves 9–15 complete; 10 issues reopened in STATE. LTS-103 completed via PR #100; next ready issue is LTS-033. LTS-104 is held until G3/tier-B gates pass.
