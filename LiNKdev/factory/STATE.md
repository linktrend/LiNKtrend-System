```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T12:10:00Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "go",
  "issues": {
    "LTS-001": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/kernel/LTS-001.md"
    },
    "LTS-002": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-002.md"
    },
    "LTS-003": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-002"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/client/LTS-003.md"
    },
    "LTS-004": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-004.md"
    },
    "LTS-005": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-004"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/admin/LTS-005.md"
    },
    "LTS-010": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/governance/LTS-010.md"
    },
    "LTS-011": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-010"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/governance/LTS-011.md"
    },
    "LTS-012": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-010"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/capabilities/LTS-012.md"
    },
    "LTS-013": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-012"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkskills/capabilities/LTS-013.md"
    },
    "LTS-020": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbrain/audit/LTS-020.md"
    },
    "LTS-021": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-020",
        "LTS-003"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbrain/librarian/LTS-021.md"
    },
    "LTS-030": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-013",
        "LTS-020"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-030.md"
    },
    "LTS-031": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-030"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-031.md"
    },
    "LTS-032": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-031"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-032.md"
    },
    "LTS-033": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-032"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-033.md"
    },
    "LTS-034": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-033"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-034.md"
    },
    "LTS-040": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-011",
        "LTS-020"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-040.md"
    },
    "LTS-041": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-040"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-041.md"
    },
    "LTS-042": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-041",
        "LTS-013"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-042.md"
    },
    "LTS-043": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-034",
        "LTS-042"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/roles/LTS-043.md"
    },
    "LTS-050": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-011",
        "LTS-040"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkguard/security/LTS-050.md"
    },
    "LTS-060": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/suite-map/LTS-060.md"
    },
    "LTS-101": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-060",
        "LTS-040",
        "LTS-002"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/lead-generation/LTS-101.md"
    },
    "LTS-102": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-101",
        "LTS-041"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/qualification/LTS-102.md"
    },
    "LTS-103": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-102",
        "LTS-042"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/template-selection/LTS-103.md"
    },
    "LTS-104": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-103",
        "LTS-030"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/website-build/LTS-104.md"
    },
    "LTS-105": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-104",
        "LTS-033"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/publish/LTS-105.md"
    },
    "LTS-106": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-105",
        "LTS-043"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/outreach/LTS-106.md"
    },
    "LTS-107": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-106"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/close-recycle/LTS-107.md"
    },
    "LTS-108": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-107",
        "LTS-003",
        "LTS-005",
        "LTS-012"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/e2e-proof/LTS-108.md"
    },
    "LTS-900": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "critical",
      "depends_on": [
        "LTS-108",
        "LTS-050",
        "LTS-021",
        "LTS-001",
        "LTS-002",
        "LTS-003",
        "LTS-004",
        "LTS-005",
        "LTS-010",
        "LTS-011",
        "LTS-012",
        "LTS-013",
        "LTS-020",
        "LTS-030",
        "LTS-031",
        "LTS-032",
        "LTS-033",
        "LTS-034",
        "LTS-040",
        "LTS-041",
        "LTS-042",
        "LTS-043",
        "LTS-060",
        "LTS-101",
        "LTS-102",
        "LTS-103",
        "LTS-104",
        "LTS-105",
        "LTS-106",
        "LTS-107"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/release/ship/LTS-900.md"
    }
  }
}
```
