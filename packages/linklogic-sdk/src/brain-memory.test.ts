import { describe, expect, it } from "vitest";

import {
  buildEpisodeSummaryPayload,
  buildLeadMemoryPayload,
  buildResearchBundlePayload,
  ComparableBusinessSchema,
  EpisodeStageSummarySchema,
  EpisodeSummaryPayloadSchema,
  LeadMemoryEngagementSchema,
  LeadMemoryFactsSchema,
  LeadMemoryPayloadSchema,
  MemoryObjectEnvelopeSchema,
  MemoryObjectScopeSchema,
  MemoryObjectStateSchema,
  MemoryObjectTypeSchema,
  ResearchBundlePayloadSchema,
  ResearchCitationSchema,
  type LeadMemoryFacts,
  type ResearchCitation,
  type ComparableBusiness,
  type EpisodeStageSummary,
} from "./brain-memory.js";

describe("MemoryObjectTypeSchema", () => {
  it("accepts valid memory types", () => {
    const validTypes = [
      "lead_memory",
      "research_bundle",
      "episode_summary",
      "capability_lease_record",
      "workflow_run_record",
    ];
    for (const type of validTypes) {
      expect(MemoryObjectTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it("rejects invalid memory types", () => {
    const invalidTypes = ["invalid_type", "lead", "research", ""];
    for (const type of invalidTypes) {
      expect(MemoryObjectTypeSchema.safeParse(type).success).toBe(false);
    }
  });
});

describe("MemoryObjectStateSchema", () => {
  it("accepts valid states", () => {
    const validStates = [
      "active",
      "archived",
      "superseded",
      "expired",
      "pending_validation",
    ];
    for (const state of validStates) {
      expect(MemoryObjectStateSchema.safeParse(state).success).toBe(true);
    }
  });

  it("rejects invalid states", () => {
    const invalidStates = ["deleted", "inactive", ""];
    for (const state of invalidStates) {
      expect(MemoryObjectStateSchema.safeParse(state).success).toBe(false);
    }
  });
});

describe("MemoryObjectScopeSchema", () => {
  it("accepts minimal scope", () => {
    const scope = {};
    expect(MemoryObjectScopeSchema.safeParse(scope).success).toBe(true);
  });

  it("accepts full scope with all fields", () => {
    const scope = {
      plugin_id: "websitefactory",
      role_id: "research_enrichment_bot",
      project_id: "proj-123",
      site_id: "site-456",
      tags: ["lead", "research", "v2"],
    };
    expect(MemoryObjectScopeSchema.safeParse(scope).success).toBe(true);
  });

  it("accepts partial scope", () => {
    const scope = { plugin_id: "linksites", tags: ["mvo"] };
    expect(MemoryObjectScopeSchema.safeParse(scope).success).toBe(true);
  });
});

describe("LeadMemoryFactsSchema", () => {
  it("accepts minimal facts", () => {
    const facts = {
      business_name: "Acme Corp",
      industry: "Manufacturing",
    };
    expect(LeadMemoryFactsSchema.safeParse(facts).success).toBe(true);
  });

  it("accepts full facts", () => {
    const facts = {
      business_name: "Acme Corp",
      industry: "Manufacturing",
      industry_taxonomy_id: "manufacturing-heavy",
      location: { city: "Detroit", region: "MI", country: "USA" },
      key_attributes: { employees: 500, founded: 1990 },
    };
    expect(LeadMemoryFactsSchema.safeParse(facts).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const facts = { industry: "Tech" };
    expect(LeadMemoryFactsSchema.safeParse(facts).success).toBe(false);
  });
});

describe("LeadMemoryEngagementSchema", () => {
  it("accepts valid engagement", () => {
    const engagement = {
      first_seen_at: "2026-05-14T12:00:00Z",
      last_engaged_at: "2026-05-15T10:30:00Z",
      total_runs: 3,
      total_episodes: 5,
      current_status: "preview_ready" as const,
    };
    expect(LeadMemoryEngagementSchema.safeParse(engagement).success).toBe(true);
  });

  it("rejects invalid status", () => {
    const engagement = {
      first_seen_at: "2026-05-14T12:00:00Z",
      last_engaged_at: "2026-05-15T10:30:00Z",
      total_runs: 1,
      total_episodes: 1,
      current_status: "unknown",
    };
    expect(LeadMemoryEngagementSchema.safeParse(engagement).success).toBe(false);
  });
});

describe("LeadMemoryPayloadSchema", () => {
  it("accepts minimal payload", () => {
    const payload = {
      lead_id: "lead-123",
      tenant_id: "tenant-456",
      facts: { business_name: "Acme", industry: "Tech" },
      engagement: {
        first_seen_at: "2026-05-14T12:00:00Z",
        last_engaged_at: "2026-05-14T12:00:00Z",
        total_runs: 1,
        total_episodes: 1,
        current_status: "new" as const,
      },
    };
    expect(LeadMemoryPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("accepts full payload", () => {
    const payload = {
      lead_id: "lead-123",
      tenant_id: "tenant-456",
      facts: {
        business_name: "Acme Corp",
        industry: "Manufacturing",
        location: { city: "Detroit" },
      },
      engagement: {
        first_seen_at: "2026-05-14T12:00:00Z",
        last_engaged_at: "2026-05-15T10:30:00Z",
        total_runs: 5,
        total_episodes: 10,
        current_status: "ready_to_contact" as const,
      },
      related_research_bundle_ids: ["rb-1", "rb-2"],
      related_episode_ids: ["ep-1", "ep-2"],
      summary_text: "Acme Corp is a manufacturing company in Detroit",
      source_run_id: "run-123",
      source_plugin_id: "websitefactory",
    };
    expect(LeadMemoryPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("provides default arrays for relations", () => {
    const payload = {
      lead_id: "lead-123",
      tenant_id: "tenant-456",
      facts: { business_name: "Acme", industry: "Tech" },
      engagement: {
        first_seen_at: "2026-05-14T12:00:00Z",
        last_engaged_at: "2026-05-14T12:00:00Z",
        total_runs: 1,
        total_episodes: 1,
        current_status: "new" as const,
      },
    };
    const parsed = LeadMemoryPayloadSchema.parse(payload);
    expect(parsed.related_research_bundle_ids).toEqual([]);
    expect(parsed.related_episode_ids).toEqual([]);
  });
});

describe("ResearchCitationSchema", () => {
  it("accepts minimal citation", () => {
    const citation = {
      citation_id: "cite-1",
      source_type: "web_search" as const,
      accessed_at: "2026-05-14T12:00:00Z",
    };
    expect(ResearchCitationSchema.safeParse(citation).success).toBe(true);
  });

  it("accepts full citation", () => {
    const citation = {
      citation_id: "cite-1",
      source_type: "web_page" as const,
      source_url: "https://example.com/article",
      source_title: "Example Article",
      accessed_at: "2026-05-14T12:00:00Z",
      relevant_quote: "A relevant quote from the article",
      citation_confidence: 0.95,
    };
    expect(ResearchCitationSchema.safeParse(citation).success).toBe(true);
  });

  it("provides default confidence of 1.0", () => {
    const citation = {
      citation_id: "cite-1",
      source_type: "web_search" as const,
      accessed_at: "2026-05-14T12:00:00Z",
    };
    const parsed = ResearchCitationSchema.parse(citation);
    expect(parsed.citation_confidence).toBe(1.0);
  });
});

describe("ComparableBusinessSchema", () => {
  it("accepts minimal comparable", () => {
    const comp = { business_name: "Competitor Inc" };
    expect(ComparableBusinessSchema.safeParse(comp).success).toBe(true);
  });

  it("accepts full comparable", () => {
    const comp = {
      business_name: "Competitor Inc",
      industry: "Tech",
      location: "San Francisco",
      website_url: "https://competitor.com",
      key_differentiators: ["faster", "cheaper"],
      similarity_score: 0.85,
    };
    expect(ComparableBusinessSchema.safeParse(comp).success).toBe(true);
  });

  it("provides default arrays", () => {
    const comp = { business_name: "Competitor Inc" };
    const parsed = ComparableBusinessSchema.parse(comp);
    expect(parsed.key_differentiators).toEqual([]);
  });
});

describe("ResearchBundlePayloadSchema", () => {
  it("accepts minimal payload with required citations", () => {
    const payload = {
      research_bundle_id: "rb-123",
      tenant_id: "tenant-456",
      lead_id: "lead-789",
      research_query: "Acme Corp manufacturing Detroit",
      research_scope: "business_profile" as const,
      findings_summary: "Acme Corp is a manufacturing company based in Detroit",
      citations: [
        {
          citation_id: "cite-1",
          source_type: "web_search" as const,
          accessed_at: "2026-05-14T12:00:00Z",
        },
      ],
      source_run_id: "run-123",
    };
    expect(ResearchBundlePayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects payload without citations", () => {
    const payload = {
      research_bundle_id: "rb-123",
      tenant_id: "tenant-456",
      lead_id: "lead-789",
      research_query: "Acme Corp",
      research_scope: "business_profile" as const,
      findings_summary: "Summary",
      citations: [],
      source_run_id: "run-123",
    };
    expect(ResearchBundlePayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("accepts comprehensive research payload", () => {
    const payload = {
      research_bundle_id: "rb-123",
      tenant_id: "tenant-456",
      lead_id: "lead-789",
      research_query: "Acme Corp manufacturing Detroit competitors",
      research_scope: "comprehensive" as const,
      findings_summary: "Detailed findings about Acme Corp and competitors",
      key_facts: [
        {
          fact_type: "founded_year",
          fact_value: "1990",
          confidence: 0.95,
          source_citation_ids: ["cite-1"],
        },
      ],
      comparable_businesses: [
        {
          business_name: "Competitor Inc",
          similarity_score: 0.8,
        },
      ],
      citations: [
        {
          citation_id: "cite-1",
          source_type: "web_page" as const,
          source_url: "https://example.com",
          source_title: "About Acme",
          accessed_at: "2026-05-14T12:00:00Z",
          relevant_quote: "Founded in 1990",
        },
      ],
      research_duration_ms: 5000,
      source_run_id: "run-123",
      source_plugin_id: "websitefactory",
      source_role_id: "research_enrichment_bot",
    };
    expect(ResearchBundlePayloadSchema.safeParse(payload).success).toBe(true);
  });
});

describe("EpisodeStageSummarySchema", () => {
  it("accepts minimal stage summary", () => {
    const stage = {
      stage_id: "stage-1",
      stage_name: "Lead Evaluation",
      status: "succeeded" as const,
      plane: "linkbot" as const,
    };
    expect(EpisodeStageSummarySchema.safeParse(stage).success).toBe(true);
  });

  it("accepts full stage summary", () => {
    const stage = {
      stage_id: "stage-1",
      stage_name: "Lead Evaluation",
      status: "succeeded" as const,
      plane: "linkbot" as const,
      started_at: "2026-05-14T12:00:00Z",
      ended_at: "2026-05-14T12:01:00Z",
      output_refs: { evaluation_score: 0.85 },
    };
    expect(EpisodeStageSummarySchema.safeParse(stage).success).toBe(true);
  });
});

describe("EpisodeSummaryPayloadSchema", () => {
  it("accepts minimal episode", () => {
    const payload = {
      episode_id: "ep-123",
      tenant_id: "tenant-456",
      run_id: "11111111-1111-4111-8111-111111111111",
      work_request_type: "websitefactory.lead_to_preview",
      plugin_id: "websitefactory",
      episode_type: "full_run" as const,
      outcome: "success" as const,
      started_at: "2026-05-14T12:00:00Z",
      completed_at: "2026-05-14T12:05:00Z",
      duration_ms: 300000,
      stages: [],
      output_refs: {
        lease_ids: [],
        workflow_run_ids: [],
        audit_event_ids: [],
      },
    };
    expect(EpisodeSummaryPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("accepts full episode with all fields", () => {
    const payload = {
      episode_id: "ep-123",
      tenant_id: "tenant-456",
      run_id: "11111111-1111-4111-8111-111111111111",
      work_request_type: "websitefactory.lead_to_preview",
      plugin_id: "websitefactory",
      episode_type: "full_run" as const,
      outcome: "success" as const,
      started_at: "2026-05-14T12:00:00Z",
      completed_at: "2026-05-14T12:05:00Z",
      duration_ms: 300000,
      stages: [
        {
          stage_id: "stage-1",
          stage_name: "Lead Evaluation",
          status: "succeeded" as const,
          plane: "linkbot" as const,
        },
      ],
      lead_id: "lead-789",
      site_id: "site-abc",
      output_refs: {
        lease_ids: ["lease-1"],
        workflow_run_ids: ["wf-1"],
        audit_event_ids: ["audit-1"],
        preview_url: "https://preview.example.com/x",
        crm_record_id: "crm-1",
        project_id: "proj-1",
        task_id: "task-1",
      },
      narrative_summary: "Successfully generated preview for Acme Corp",
      keywords: ["lead", "preview", "success"],
    };
    expect(EpisodeSummaryPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("validates outcome constraints", () => {
    const base = {
      episode_id: "ep-123",
      tenant_id: "tenant-456",
      run_id: "11111111-1111-4111-8111-111111111111",
      work_request_type: "websitefactory.lead_to_preview",
      plugin_id: "websitefactory",
      episode_type: "full_run",
      started_at: "2026-05-14T12:00:00Z",
      completed_at: "2026-05-14T12:05:00Z",
      duration_ms: 300000,
      stages: [],
      output_refs: { lease_ids: [], workflow_run_ids: [], audit_event_ids: [] },
    };

    // Valid outcomes
    for (const outcome of ["success", "partial", "failure", "cancelled"]) {
      expect(EpisodeSummaryPayloadSchema.safeParse({ ...base, outcome }).success).toBe(true);
    }
  });
});

describe("MemoryObjectEnvelopeSchema", () => {
  it("accepts minimal envelope", () => {
    const envelope = {
      tenant_id: "tenant-456",
      type: "episode_summary" as const,
      scope: {},
      provenance_event_ids: [],
      payload: {
        episode_id: "ep-123",
        tenant_id: "tenant-456",
        run_id: "11111111-1111-4111-8111-111111111111",
        work_request_type: "websitefactory.lead_to_preview",
        plugin_id: "websitefactory",
        episode_type: "full_run" as const,
        outcome: "success" as const,
        started_at: "2026-05-14T12:00:00Z",
        completed_at: "2026-05-14T12:05:00Z",
        duration_ms: 300000,
        stages: [],
        output_refs: { lease_ids: [], workflow_run_ids: [], audit_event_ids: [] },
      },
      source_plane: "linkbrain" as const,
    };
    expect(MemoryObjectEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });

  it("accepts full envelope", () => {
    const envelope = {
      id: "11111111-1111-4111-8111-111111111111",
      tenant_id: "tenant-456",
      type: "research_bundle" as const,
      scope: {
        plugin_id: "websitefactory",
        role_id: "research_enrichment_bot",
        tags: ["lead", "research"],
      },
      provenance_event_ids: ["22222222-2222-4222-8222-222222222222"],
      payload: {
        research_bundle_id: "rb-123",
        tenant_id: "tenant-456",
        lead_id: "lead-789",
        research_query: "Acme Corp",
        research_scope: "business_profile" as const,
        findings_summary: "Summary",
        citations: [
          {
            citation_id: "cite-1",
            source_type: "web_search" as const,
            accessed_at: "2026-05-14T12:00:00Z",
          },
        ],
        source_run_id: "run-123",
      },
      state: "active" as const,
      confidence: 0.95,
      created_at: "2026-05-14T12:00:00Z",
      updated_at: "2026-05-14T12:00:00Z",
      source_plane: "linkbot" as const,
      run_id: "run-123",
      plugin_id: "websitefactory",
      role_id: "research_enrichment_bot",
    };
    expect(MemoryObjectEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });

  it("provides defaults for optional fields", () => {
    const envelope = {
      tenant_id: "tenant-456",
      type: "lead_memory" as const,
      scope: {},
      provenance_event_ids: [],
      payload: {
        lead_id: "lead-123",
        tenant_id: "tenant-456",
        facts: { business_name: "Acme", industry: "Tech" },
        engagement: {
          first_seen_at: "2026-05-14T12:00:00Z",
          last_engaged_at: "2026-05-14T12:00:00Z",
          total_runs: 1,
          total_episodes: 1,
          current_status: "new" as const,
        },
      },
      source_plane: "linkbrain" as const,
    };
    const parsed = MemoryObjectEnvelopeSchema.parse(envelope);
    expect(parsed.state).toBe("active");
    expect(parsed.confidence).toBe(1.0);
  });

  it("rejects confidence outside range", () => {
    const envelope = {
      tenant_id: "tenant-456",
      type: "episode_summary" as const,
      scope: {},
      provenance_event_ids: [],
      payload: {
        episode_id: "ep-123",
        tenant_id: "tenant-456",
        run_id: "11111111-1111-4111-8111-111111111111",
        work_request_type: "websitefactory.lead_to_preview",
        plugin_id: "websitefactory",
        episode_type: "full_run" as const,
        outcome: "success" as const,
        started_at: "2026-05-14T12:00:00Z",
        completed_at: "2026-05-14T12:05:00Z",
        duration_ms: 300000,
        stages: [],
        output_refs: { lease_ids: [], workflow_run_ids: [], audit_event_ids: [] },
      },
      confidence: 1.5,
      source_plane: "linkbrain" as const,
    };
    expect(MemoryObjectEnvelopeSchema.safeParse(envelope).success).toBe(false);
  });
});

describe("buildLeadMemoryPayload", () => {
  it("creates payload with defaults", () => {
    const facts: LeadMemoryFacts = {
      business_name: "Acme Corp",
      industry: "Manufacturing",
    };
    const payload = buildLeadMemoryPayload("lead-123", "tenant-456", facts);

    expect(payload.lead_id).toBe("lead-123");
    expect(payload.tenant_id).toBe("tenant-456");
    expect(payload.facts).toEqual(facts);
    expect(payload.engagement.total_runs).toBe(1);
    expect(payload.engagement.current_status).toBe("new");
    expect(payload.related_research_bundle_ids).toEqual([]);
    expect(payload.related_episode_ids).toEqual([]);
  });

  it("includes source_run_id when provided", () => {
    const facts: LeadMemoryFacts = {
      business_name: "Acme Corp",
      industry: "Manufacturing",
    };
    const payload = buildLeadMemoryPayload("lead-123", "tenant-456", facts, "run-abc");
    expect(payload.source_run_id).toBe("run-abc");
  });
});

describe("buildResearchBundlePayload", () => {
  it("creates payload with required fields", () => {
    const citations: ResearchCitation[] = [
      {
        citation_id: "cite-1",
        source_type: "web_search",
        accessed_at: "2026-05-14T12:00:00Z",
        citation_confidence: 1.0,
      },
    ];
    const payload = buildResearchBundlePayload(
      "tenant-456",
      "lead-789",
      "Acme Corp research",
      "Findings about Acme",
      citations,
      "run-123",
    );

    expect(payload.tenant_id).toBe("tenant-456");
    expect(payload.lead_id).toBe("lead-789");
    expect(payload.research_query).toBe("Acme Corp research");
    expect(payload.findings_summary).toBe("Findings about Acme");
    expect(payload.citations).toEqual(citations);
    expect(payload.source_run_id).toBe("run-123");
    expect(payload.research_scope).toBe("comprehensive");
  });

  it("accepts options for scope and comparables", () => {
    const citations: ResearchCitation[] = [
      {
        citation_id: "cite-1",
        source_type: "web_search",
        accessed_at: "2026-05-14T12:00:00Z",
        citation_confidence: 1.0,
      },
    ];
    const comparables: ComparableBusiness[] = [
      { business_name: "Competitor Inc", key_differentiators: [] },
    ];
    const payload = buildResearchBundlePayload(
      "tenant-456",
      "lead-789",
      "Acme Corp",
      "Summary",
      citations,
      "run-123",
      {
        research_scope: "business_profile",
        comparable_businesses: comparables,
      },
    );

    expect(payload.research_scope).toBe("business_profile");
    expect(payload.comparable_businesses).toEqual(comparables);
  });
});

describe("buildEpisodeSummaryPayload", () => {
  it("creates payload with required fields", () => {
    const stages: EpisodeStageSummary[] = [
      {
        stage_id: "stage-1",
        stage_name: "Lead Evaluation",
        status: "succeeded",
        plane: "linkbot",
      },
    ];
    const payload = buildEpisodeSummaryPayload(
      "tenant-456",
      "run-123",
      "websitefactory.lead_to_preview",
      "websitefactory",
      stages,
      "success",
      "2026-05-14T12:00:00Z",
      "2026-05-14T12:05:00Z",
    );

    expect(payload.tenant_id).toBe("tenant-456");
    expect(payload.run_id).toBe("run-123");
    expect(payload.episode_id).toMatch(/^ep_run-123/);
    expect(payload.duration_ms).toBe(300000); // 5 minutes
    expect(payload.stages).toEqual(stages);
  });

  it("calculates duration correctly", () => {
    const stages: EpisodeStageSummary[] = [];
    const payload = buildEpisodeSummaryPayload(
      "tenant-456",
      "run-123",
      "type",
      "plugin",
      stages,
      "success",
      "2026-05-14T12:00:00Z",
      "2026-05-14T12:10:00Z",
    );

    expect(payload.duration_ms).toBe(600000); // 10 minutes
  });

  it("includes optional fields when provided", () => {
    const stages: EpisodeStageSummary[] = [];
    const payload = buildEpisodeSummaryPayload(
      "tenant-456",
      "run-123",
      "type",
      "plugin",
      stages,
      "success",
      "2026-05-14T12:00:00Z",
      "2026-05-14T12:05:00Z",
      {
        lead_id: "lead-789",
        site_id: "site-abc",
        output_refs: {
          lease_ids: ["lease-1"],
          preview_url: "https://preview.example.com/x",
        },
        narrative_summary: "A successful run",
      },
    );

    expect(payload.lead_id).toBe("lead-789");
    expect(payload.site_id).toBe("site-abc");
    expect(payload.output_refs.lease_ids).toEqual(["lease-1"]);
    expect(payload.output_refs.preview_url).toBe("https://preview.example.com/x");
    expect(payload.narrative_summary).toBe("A successful run");
  });
});
