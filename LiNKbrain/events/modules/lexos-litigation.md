# LEXOS Litigation LiNKbrain Event Schema

This document defines the audit and memory events required for LEXOS Litigation module integration with LiNKbrain.

## Event Categories

### 1. Core Lifecycle Events

Events emitted by all LEXOS workflow runs:

| Event Type | Stage | Description | Required Fields |
|------------|-------|-------------|-----------------|
| `run.started` | All | Workflow run initiated | `run_id`, `tenant_id`, `work_request_type`, `requested_by` |
| `run.completed` | All | Workflow run completed successfully | `run_id`, `result_summary`, `duration_ms` |
| `run.failed` | All | Workflow run failed | `run_id`, `error_code`, `error_message`, `recovery_hint` |
| `run.cancelled` | All | Workflow run cancelled by operator | `run_id`, `cancelled_by`, `reason` |
| `stage.started` | W0-W11 | Individual stage started | `stage`, `matter_id`, `role_id` |
| `stage.completed` | W0-W11 | Individual stage completed | `stage`, `matter_id`, `outputs_summary` |
| `stage.failed` | W0-W11 | Individual stage failed | `stage`, `matter_id`, `error_details` |
| `stage.awaiting_approval` | W0, W4, W11 | Stage paused for human approval | `stage`, `matter_id`, `approval_type` |

### 2. LinkSkills Lease Events

Events related to capability leases:

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `lease.requested` | Lease requested for capability | `lease_id`, `capability_id`, `requester_role` |
| `lease.granted` | Lease granted | `lease_id`, `granted_by`, `expiry` |
| `lease.executed` | Capability executed under lease | `lease_id`, `operation`, `result_status` |
| `lease.denied` | Lease denied | `lease_id`, `denial_reason`, `policy_ref` |

### 3. LiNKautowork Events

Events related to deterministic workflow execution:

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `workflow.invoked` | Workflow template invoked | `workflow_handle`, `workflow_run_id`, `inputs_hash` |
| `workflow.completed` | Workflow completed | `workflow_run_id`, `outputs_hash`, `duration_ms` |
| `workflow.failed` | Workflow failed | `workflow_run_id`, `failure_stage`, `error_log_ref` |

### 4. LEXOS-Specific Events

#### W0: Client Onboarding

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `intake.processed` | Intake record created | `intake_id`, `intake_type`, `urgency_level` |
| `conflict.checked` | Conflict check completed | `intake_id`, `conflict_status`, `check_method` |
| `client.accepted` | Client promoted to active | `client_id`, `intake_id`, `accepted_by` |
| `client.rejected` | Client/intake rejected | `intake_id`, `rejection_reason`, `reviewed_by` |
| `kyc.completed` | KYC screening completed | `client_candidate_id`, `kyc_status`, `risk_level` |

#### W1: Client Master Record

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `memory.updated` | Client memory updated | `client_id`, `update_type`, `facts_added` |
| `promotion.processed` | Fact promoted to master | `client_id`, `source_intake_id`, `promoted_facts` |

#### W2: Case-Client Story

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `story.created` | Case master story created | `case_story_id`, `matter_id`, `story_length` |
| `assertions.extracted` | Assertions extracted | `case_story_id`, `assertions_created`, `by_truth_state` |
| `timeline.built` | Timeline events extracted | `case_story_id`, `timeline_events_count` |
| `gaps.identified` | Factual gaps identified | `case_story_id`, `gaps_count`, `gap_categories` |

#### W4: Evidence Intake

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `evidence.ingested` | Evidence uploaded and stored | `evidence_id`, `matter_id`, `file_type`, `file_size` |
| `evidence.classified` | Evidence classified | `evidence_id`, `evidence_type`, `confidentiality`, `privilege` |
| `extraction.queued` | Extraction job queued | `evidence_id`, `extraction_id`, `extraction_types` |
| `extraction.started` | Extraction processing started | `extraction_id`, `processor_type` |
| `extraction.completed` | Extraction finished | `extraction_id`, `quality_score`, `output_format` |
| `extraction.failed` | Extraction failed | `extraction_id`, `failure_reason`, `retry_eligible` |
| `extraction.qa_flagged` | QA flagged for review | `extraction_id`, `qa_flags`, `review_required` |
| `custody.logged` | Chain of custody updated | `evidence_id`, `custody_action`, `actor` |

#### W5: Support Matrix

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `support.mapped` | Evidence-to-assertion mapping created | `support_matrix_item_id`, `assertion_id`, `evidence_id`, `support_level` |
| `contradictions.found` | Contradictions identified | `matter_id`, `contradiction_count`, `severity_summary` |
| `assertion.state_changed` | Assertion truth state updated | `assertion_id`, `previous_state`, `new_state`, `reason` |

#### W6: Strategy

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `strategy.developed` | Strategy memo created | `strategy_memo_id`, `matter_id`, `strategy_points_count` |
| `risks.identified` | Risks registered | `strategy_memo_id`, `risks_count`, `severity_breakdown` |
| `research.questions_defined` | Research questions queued | `strategy_memo_id`, `questions_count` |

#### W7: Legal Research

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `research.performed` | Research memo created | `research_memo_id`, `matter_id`, `authorities_found` |
| `citations.verified` | Citations verified | `research_memo_id`, `citations_checked`, `verification_rate` |
| `adverse.authority_found` | Adverse authority identified | `research_memo_id`, `authority_citation`, `risk_level` |

#### W8: Argument Drafting

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `argument.drafted` | Argument draft created | `argument_draft_id`, `matter_id`, `argument_type` |
| `claims.linked` | Claims linked to evidence | `argument_draft_id`, `supported_claims`, `unsupported_claims` |
| `citations.inserted` | Citations added to draft | `argument_draft_id`, `citations_count` |

#### W9: Adversarial Review

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `critique.completed` | Adversarial critique created | `adversarial_critique_id`, `argument_draft_id`, `attack_vectors_count` |
| `weaknesses.found` | Weaknesses identified | `adversarial_critique_id`, `weakness_count`, `severity_breakdown` |
| `revision.checklist_created` | Revision checklist generated | `adversarial_critique_id`, `checklist_items_count` |

#### W11: Output Refinement

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `output.refined` | Final output artifact created | `output_artifact_id`, `matter_id`, `file_format` |
| `caveats.preserved` | Caveats verified preserved | `output_artifact_id`, `caveats_preserved`, `missing_caveats` |
| `bundle.prepared` | Final bundle assembled | `output_artifact_id`, `bundle_contents`, `artifact_uri` |

### 5. Role Lifecycle Events

| Event Type | Description | Required Fields |
|------------|-------------|-----------------|
| `role.started` | Role instance started | `role_id`, `mission_id`, `context_refs` |
| `role.completed` | Role instance completed | `role_id`, `mission_id`, `outputs_summary` |
| `role.failed` | Role instance failed | `role_id`, `mission_id`, `failure_reason` |

## Event Schema Structure

All events follow the LiNKbrain audit envelope schema:

```typescript
interface LexosAuditEvent {
  // Envelope metadata
  event_id: string;           // UUID
  event_type: string;         // From tables above
  event_version: "1.0";
  emitted_at: string;         // ISO8601 timestamp

  // Tenant/module context
  tenant_id: string;          // UUID
  module_id: "lexos_litigation";

  // Actor information
  actor: {
    kind: "user" | "bot" | "system" | "workflow";
    id: string;
    role_id?: string;         // For bot actors
  };

  // Target entity
  target: {
    entity_kind: "intake" | "client" | "matter" | "evidence" | "assertion" | "story" | "memo" | "draft" | "critique" | "artifact";
    entity_id: string;
  };

  // Event payload (varies by event_type)
  payload: Record<string, unknown>;

  // Cross-plane references
  refs: {
    run_id?: string;
    lease_id?: string;
    workflow_run_id?: string;
    mission_id?: string;
  };

  // Integrity
  integrity: {
    hash: string;
    algorithm: "sha256";
  };
}
```

## Memory Object Promotion

Certain audit events should be promoted to LiNKbrain memory objects:

| Source Event | Memory Object Type | Retention |
|--------------|-------------------|-----------|
| `client.accepted` | `lexos_client` | Persistent |
| `matter.created` | `lexos_matter` | Persistent |
| `story.created` | `lexos_case_story` | Matter-bound |
| `assertions.extracted` | `lexos_assertion_bundle` | Matter-bound |
| `strategy.developed` | `lexos_strategy` | Matter-bound |
| `research.performed` | `lexos_research` | Matter-bound |
| `argument.drafted` | `lexos_argument` | Matter-bound |
| `output.refined` | `lexos_output` | Persistent |

## Context Assembly Requirements

For LEXOS context assembly, the following should be retrievable:

1. **Matter Context**: Current matter state, workflow stage, key assertions
2. **Client Context**: Client master record, history, facts
3. **Evidence Context**: Recent evidence, extractions, quality flags
4. **Support Context**: Support matrix state, contradictions, gaps
5. **Strategy Context**: Strategy memo, risks, research questions
6. **Research Context**: Legal authorities, citations, adverse authority
7. **Argument Context**: Draft arguments, critique responses

## Implementation Notes

- All events must be emitted through the LinkSkills lease mechanism when side effects occur
- Event ordering must be preserved per matter (causal consistency)
- Event payloads should be compact; large content (stories, memos) stored separately with content refs
- Human approval gates at W0 acceptance, W4 evidence ingest, and W11 output generation require explicit audit logging
