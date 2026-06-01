```json
{
  "version": 1,
  "program_id": "linktrend-system",
  "phase": "running",
  "updated_at": "2026-06-01T00:03:51Z",
  "principal_stop_reason": "",
  "next_orchestrator_trigger": "go",
  "issues": {
    "LTS-001": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/foundation/LTS-001.md"
    },
    "LTS-002": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/foundation/LTS-002.md"
    },
    "LTS-003": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkaios/foundation/LTS-003.md"
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
    "LTS-020": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-001"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbrain/audit/LTS-020.md"
    },
    "LTS-030": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-011",
        "LTS-020"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkautowork/workflows/LTS-030.md"
    },
    "LTS-040": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-010",
        "LTS-020"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkbot/runtime/LTS-040.md"
    },
    "LTS-050": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-040"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linkguard/security/LTS-050.md"
    },
    "LTS-060": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-030",
        "LTS-040"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/integration/LTS-060.md"
    },
    "LTS-061": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-002",
        "LTS-060"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/integration/LTS-061.md"
    },
    "LTS-062": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-061",
        "LTS-003"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/integration/LTS-062.md"
    },
    "LTS-063": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "standard",
      "depends_on": [
        "LTS-062"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/linksites/e2e/LTS-063.md"
    },
    "LTS-900": {
      "status": "planned",
      "runtime": "cursor",
      "tier": "critical",
      "depends_on": [
        "LTS-001",
        "LTS-002",
        "LTS-003",
        "LTS-010",
        "LTS-011",
        "LTS-020",
        "LTS-030",
        "LTS-040",
        "LTS-050",
        "LTS-060",
        "LTS-061",
        "LTS-062",
        "LTS-063"
      ],
      "report": "LiNKdev/product/reports/linktrend-system/release/ship/LTS-900.md"
    }
  }
}
```
