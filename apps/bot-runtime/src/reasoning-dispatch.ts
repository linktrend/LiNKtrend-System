/**
 * LinkBot reasoning dispatch — thin runtime adapter for WebsiteFactory stages.
 *
 * Implements `bot.reason` per `.ai-swarm/CONTRACTS_MVO.md` §6.1.
 * LinkBot does NOT own memory, leases, secrets, workflows, or deterministic execution.
 * It delegates model calls to OpenRouter and emits audit events to LiNKbrain.
 */

import { log } from "@linktrend/observability";
import type { Env } from "@linktrend/shared-config";
import {
  type BotReasonRequest,
  type BotReasonResult,
  type FailureReport,
  type ReasoningKind,
  type LeadInput,
  type AuditEvent,
  writeBrainAuditEvent,
} from "@linktrend/linklogic-sdk";
import { randomUUID } from "node:crypto";

// Model routing profile to OpenRouter model mapping (per DECISIONS.md D-06)
const MODEL_ROUTING_PROFILES: Record<string, { model: string; maxTokens: number; temperature: number }> = {
  default: { model: "openai/gpt-4o-mini", maxTokens: 2048, temperature: 0.7 },
  fast: { model: "openai/gpt-4o-mini", maxTokens: 1024, temperature: 0.5 },
  quality: { model: "anthropic/claude-3.5-sonnet", maxTokens: 4096, temperature: 0.7 },
};

/**
 * Strip contact PII from inputs per `pii_policy="strip_contact"` (§3.4, §6.1).
 * Removes: contact.name, contact.email, contact.phone from LeadInput.
 * Keeps: business_name, industry, location, notes.
 */
export function stripContactPii(inputs: Record<string, unknown>): Record<string, unknown> {
  const stripped: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(inputs)) {
    if (key === "contact" || key === "contact_email" || key === "contact_phone") {
      continue; // Strip all contact PII
    }
    // Recursively strip nested objects (except arrays)
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      stripped[key] = stripContactPii(value as Record<string, unknown>);
    } else {
      stripped[key] = value;
    }
  }

  return stripped;
}

/**
 * Redact PII for logging (§3.4).
 * Replaces email/phone with [redacted:email] / [redacted:phone].
 */
export function redactForLogging(text: string): string {
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[redacted:email]")
    .replace(/\+[1-9]\d{1,14}/g, "[redacted:phone]");
}

/**
 * Model call adapter interface.
 * Per §12.3, LinkBot does not own secrets. The kernel/runtime boundary
 * provides either an API key or a pre-configured adapter.
 */
export interface ModelCallAdapter {
  /** Optional API key provided by kernel/runtime boundary (MVO: may be omitted, falls back to env) */
  apiKey?: string;
  /** Optional base URL for OpenRouter (defaults to official endpoint) */
  baseUrl?: string;
  /** HTTP referrer header for OpenRouter analytics */
  httpReferer?: string;
}

/**
 * Call OpenRouter API for model reasoning.
 * In stub/test mode (no API key provided and OPENROUTER_API_KEY not set), returns deterministic stub responses.
 *
 * MVO EXCEPTION: If no adapter/apiKey is provided, falls back to reading OPENROUTER_API_KEY
 * from env. This is an MVO expedient; post-MVO the kernel should provide the adapter.
 */
async function callOpenRouter(
  env: Env,
  params: {
    modelRoutingProfile: string;
    systemPrompt: string;
    userPrompt: string;
    modelRunId: string;
    adapter?: ModelCallAdapter;
  },
): Promise<{ text: string; tokensIn: number; tokensOut: number; failure?: FailureReport }> {
  // Per §12.3: LinkBot receives the secret via adapter from kernel, NOT from direct env ownership
  // MVO exception: fallback to env when adapter not provided (documented below)
  const apiKey = params.adapter?.apiKey ?? env.OPENROUTER_API_KEY;
  const profile = MODEL_ROUTING_PROFILES[params.modelRoutingProfile] ?? MODEL_ROUTING_PROFILES.default;

  // Stub mode: return deterministic responses for testing
  if (!apiKey) {
    log("info", "OpenRouter stub mode — returning deterministic response", {
      service: "bot-runtime",
      modelRunId: params.modelRunId,
      profile: params.modelRoutingProfile,
    });

    // Generate a reasonable stub response based on prompt length
    const stubResponse = generateStubResponse(params.userPrompt, params.systemPrompt);
    return {
      text: stubResponse,
      tokensIn: Math.ceil(params.systemPrompt.length / 4) + Math.ceil(params.userPrompt.length / 4),
      tokensOut: Math.ceil(stubResponse.length / 4),
    };
  }

  const body = {
    model: profile.model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    max_tokens: profile.maxTokens,
    temperature: profile.temperature,
  };

  // Use adapter-provided config or fall back to env/MVO defaults
  const httpReferer = params.adapter?.httpReferer ?? env.LINKTREND_PUBLIC_BASE_URL ?? "https://linktrend.local";
  const apiUrl = params.adapter?.baseUrl ?? "https://openrouter.ai/api/v1/chat/completions";

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        "http-referer": httpReferer,
        "x-title": "LiNKtrend LinkBot",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const text = await res.text();
      const code = res.status === 429 ? "MODEL_QUOTA_EXCEEDED" : "MODEL_PROVIDER_ERROR";
      return {
        text: "",
        tokensIn: 0,
        tokensOut: 0,
        failure: {
          code,
          plane: "linkbot",
          message: `OpenRouter error ${res.status}: ${redactForLogging(text.slice(0, 200))}`,
          retryable: res.status >= 500 || res.status === 429,
          occurred_at: new Date().toISOString(),
        },
      };
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const message = data.choices?.[0]?.message?.content ?? "";
    const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0 };

    return {
      text: message,
      tokensIn: usage.prompt_tokens ?? Math.ceil(params.systemPrompt.length / 4),
      tokensOut: usage.completion_tokens ?? Math.ceil(message.length / 4),
    };
  } catch (e: unknown) {
    const isTimeout = e instanceof Error &&
      (e.name === "AbortError" ||
       e.message?.includes("AbortError") ||
       e.message?.includes("timeout") ||
       e.message?.includes("Abort"));
    return {
      text: "",
      tokensIn: 0,
      tokensOut: 0,
      failure: {
        code: isTimeout ? "MODEL_TIMEOUT" : "MODEL_PROVIDER_ERROR",
        plane: "linkbot",
        message: isTimeout ? "OpenRouter request timed out" : `OpenRouter fetch failed: ${String(e).slice(0, 200)}`,
        retryable: true,
        occurred_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * Generate a deterministic stub response for testing.
 */
function generateStubResponse(userPrompt: string, systemPrompt: string): string {
  // Simple pattern matching to generate appropriate stub responses
  if (systemPrompt.includes("lead evaluation")) {
    return JSON.stringify({
      score: 75,
      segment: "small_business",
      rationale: "Business has clear web presence needs based on industry classification.",
    });
  }
  if (systemPrompt.includes("template selection")) {
    return JSON.stringify({ template_id: "local_service_v1" });
  }
  if (systemPrompt.includes("copy generation")) {
    return JSON.stringify({
      blocks: [
        { block_id: "hero_headline", text: { en: "Professional Services You Can Trust" } },
        { block_id: "hero_subheadline", text: { en: "Serving your community with excellence" } },
        { block_id: "about_lead", text: { en: "We bring years of expertise to every project." } },
        { block_id: "services_intro", text: { en: "Our services are tailored to your unique needs." } },
        { block_id: "cta_primary", text: { en: "Get Started Today" } },
      ],
      locale: "en",
    });
  }
  if (systemPrompt.includes("media placement")) {
    return JSON.stringify({
      placements: [
        { block_id: "hero_image", asset_ref: "stock/hero-business-1", kind: "stock" },
        { block_id: "about_image", asset_ref: "stock/about-team-1", kind: "stock" },
        { block_id: "services_icon", asset_ref: "placeholder/service-icon", kind: "placeholder" },
      ],
    });
  }
  return "{\"result\": \"stub\"}";
}

// System prompts for each reasoning kind
const SYSTEM_PROMPTS: Record<ReasoningKind, string> = {
  lead_evaluation: `You are a lead evaluation assistant for a website factory service.
Analyze the provided business information and return a JSON object with:
- score: number (0-100) representing lead quality/fit
- segment: string (one of: small_business, professional_service, retail, ecommerce, enterprise, other)
- rationale: string (brief explanation of the scoring)

Return ONLY valid JSON, no markdown formatting, no explanation text.`,

  template_selection: `You are a template selection assistant for a website factory service.
Based on the business industry and evaluation, select the most appropriate template.

Available templates:
- local_service_v1: For local service businesses (plumbers, electricians, cleaners)
- professional_v1: For professional services (consultants, lawyers, accountants)
- retail_v1: For retail storefronts
- ecommerce_v1: For online stores
- portfolio_v1: For creative professionals
- minimal_v1: Generic minimal template

Return a JSON object with:
- template_id: string (the selected template slug)

Return ONLY valid JSON, no markdown formatting.`,

  copy_generation: `You are a copy generation assistant for a website factory service.
Generate compelling website copy based on the business information.

Return a JSON object with:
- blocks: array of objects, each with:
  - block_id: string (one of: hero_headline, hero_subheadline, about_lead, services_intro, cta_primary, testimonials_intro, contact_cta)
  - text: object with locale keys (e.g., {"en": "..."})
- locale: string (default "en")

Write professional, benefit-focused copy appropriate for the industry.
Return ONLY valid JSON, no markdown formatting.`,

  media_placement: `You are a media placement assistant for a website factory service.
Recommend visual assets for each content block.

Return a JSON object with:
- placements: array of objects, each with:
  - block_id: string (matches copy block_ids: hero_image, about_image, services_icon, etc.)
  - asset_ref: string (identifier like "stock/hero-business-1" or "placeholder/generic")
  - kind: string (one of: "stock" for stock photos, "placeholder" for generic placeholders)

Return ONLY valid JSON, no markdown formatting.`,
};

/**
 * Build user prompt from stripped inputs.
 */
function buildUserPrompt(kind: ReasoningKind, inputs: Record<string, unknown>): string {
  const leadInput = inputs.lead_input as LeadInput | undefined;

  const parts: string[] = [];

  if (leadInput) {
    parts.push(`Business Name: ${leadInput.business_name}`);
    parts.push(`Industry: ${leadInput.industry}`);
    if (leadInput.industry_taxonomy_id) {
      parts.push(`Taxonomy ID: ${leadInput.industry_taxonomy_id}`);
    }
    if (leadInput.location?.city) {
      parts.push(`Location: ${leadInput.location.city}, ${leadInput.location.region ?? ""}`);
    }
    if (leadInput.notes) {
      parts.push(`Notes: ${leadInput.notes}`);
    }
  }

  // Include previous stage outputs if available
  if (inputs.lead_evaluation && kind !== "lead_evaluation") {
    parts.push(`Lead Evaluation: ${JSON.stringify(inputs.lead_evaluation)}`);
  }
  if (inputs.template_id && kind !== "template_selection") {
    parts.push(`Selected Template: ${inputs.template_id}`);
  }
  if (inputs.copy_bundle && kind !== "copy_generation") {
    parts.push(`Copy Bundle: ${JSON.stringify(inputs.copy_bundle)}`);
  }

  return parts.join("\n");
}

/**
 * Parse model output based on reasoning kind.
 */
function parseModelOutput(kind: ReasoningKind, text: string): Record<string, unknown> | FailureReport {
  try {
    // Try to extract JSON from possible markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const cleanText = jsonMatch ? jsonMatch[1].trim() : text.trim();

    const parsed = JSON.parse(cleanText);

    switch (kind) {
      case "lead_evaluation": {
        if (typeof parsed.score !== "number" || !parsed.segment || !parsed.rationale) {
          return {
            code: "MODEL_OUTPUT_INVALID",
            plane: "linkbot",
            message: "lead_evaluation output missing required fields (score, segment, rationale)",
            retryable: false,
            occurred_at: new Date().toISOString(),
          };
        }
        return {
          lead_evaluation: {
            score: parsed.score,
            segment: parsed.segment,
            rationale: parsed.rationale,
          },
        };
      }

      case "template_selection": {
        if (!parsed.template_id) {
          return {
            code: "MODEL_OUTPUT_INVALID",
            plane: "linkbot",
            message: "template_selection output missing required field (template_id)",
            retryable: false,
            occurred_at: new Date().toISOString(),
          };
        }
        return { template_id: parsed.template_id };
      }

      case "copy_generation": {
        if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
          return {
            code: "MODEL_OUTPUT_INVALID",
            plane: "linkbot",
            message: "copy_generation output missing required field (blocks array)",
            retryable: false,
            occurred_at: new Date().toISOString(),
          };
        }
        return {
          copy_bundle: {
            blocks: parsed.blocks,
            locale: parsed.locale ?? "en",
          },
        };
      }

      case "media_placement": {
        if (!parsed.placements || !Array.isArray(parsed.placements)) {
          return {
            code: "MODEL_OUTPUT_INVALID",
            plane: "linkbot",
            message: "media_placement output missing required field (placements array)",
            retryable: false,
            occurred_at: new Date().toISOString(),
          };
        }
        return { media_plan: { placements: parsed.placements } };
      }
    }
  } catch (e) {
    return {
      code: "MODEL_OUTPUT_INVALID",
      plane: "linkbot",
      message: `Failed to parse model output as JSON: ${String(e).slice(0, 200)}`,
      retryable: false,
      occurred_at: new Date().toISOString(),
      details: { raw_output: text.slice(0, 500) },
    };
  }
}

/**
 * Audit write result — either success with event_id or failure.
 * Per §4.5, a stage that cannot confirm its audit event MUST NOT be considered complete.
 */
type AuditEmitResult =
  | { success: true; event_id: string }
  | { success: false; failure: FailureReport };

/**
 * Emit audit event to LiNKbrain via `brain.audit.write`.
 *
 * Per §4.5: If LiNKbrain is unreachable, the emitter MUST queue locally and retry;
 * a stage that cannot confirm its `*.completed` audit event MUST NOT transition the
 * run to a terminal `succeeded` state.
 *
 * Returns structured result so caller can fail the stage if audit is not persisted.
 */
async function emitAuditEvent(
  env: Env,
  event: Omit<AuditEvent, "event_id" | "ts" | "schema_version">,
): Promise<AuditEmitResult> {
  const fullEvent: AuditEvent = {
    ...event,
    event_id: randomUUID(),
    ts: new Date().toISOString(),
    schema_version: "1",
  };

  const result = await writeBrainAuditEvent(env, fullEvent);

  if (result.failure) {
    log("warn", "Failed to write audit event", {
      service: "bot-runtime",
      event_id: fullEvent.event_id,
      failure: result.failure.message,
    });
    return {
      success: false,
      failure: {
        code: "KERNEL_PERSISTENCE_FAILED",
        plane: "linkbot",
        message: `Audit event write failed: ${result.failure.message}`,
        retryable: true, // Audit writes are retryable
        occurred_at: new Date().toISOString(),
        details: { audit_event_id: fullEvent.event_id, action: event.action },
      },
    };
  }

  return { success: true, event_id: fullEvent.event_id };
}

/**
 * Main reasoning dispatch handler — `bot.reason` implementation.
 *
 * §6.1 LinkBot is a delegating shell:
 * - Accepts stage dispatch from LiNKaios kernel
 * - Returns typed outputs with model_run_id
 * - Emits audit events but does NOT own canonical memory
 * - Does NOT hold leases, secrets, or deterministic workflow state
 *
 * §12.3 LinkBot MUST NOT hold secrets. The optional `adapter` parameter receives
 * model-call configuration from the kernel/runtime boundary. For MVO, if no
 * adapter is provided, falls back to env (documented exception with clear
 * ownership boundary: LinkBot does not OWN the secret, it only passes through
 * the adapter provided by the deployment boundary).
 *
 * Per §4.5: If audit event emission fails, the stage returns a failure so the
 * kernel knows the stage is NOT complete and can retry.
 */
export async function handleReasoningDispatch(
  env: Env,
  request: BotReasonRequest,
  adapter?: ModelCallAdapter,
): Promise<BotReasonResult> {
  const modelRunId = randomUUID();
  const startTime = Date.now();

  log("info", "Reasoning dispatch started", {
    service: "bot-runtime",
    run_id: request.run_id,
    stage_id: request.stage_id,
    reasoning_kind: request.reasoning_kind,
    modelRunId,
    hasAdapter: Boolean(adapter),
  });

  // Validate pii_policy (MVO only supports "strip_contact")
  if (request.pii_policy !== "strip_contact") {
    return {
      outputs: {},
      model_run_id: modelRunId,
      tokens_in: 0,
      tokens_out: 0,
      failure: {
        code: "MODEL_PROVIDER_ERROR",
        plane: "linkbot",
        message: `Unsupported pii_policy: ${request.pii_policy}. Only "strip_contact" is supported.`,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    };
  }

  // Strip PII from inputs before sending to model
  const strippedInputs = stripContactPii(request.inputs);

  // Emit stage.started audit event
  const startedEmit = await emitAuditEvent(env, {
    tenant_id: request.tenant_id,
    plane: "linkbot",
    actor: { actor_kind: "bot", actor_id: "linkbot-reasoning" },
    action: "stage.started",
    subject: {
      run_id: request.run_id,
      stage_id: request.stage_id,
    },
    payload: {
      reasoning_kind: request.reasoning_kind,
      model_routing_profile: request.model_routing_profile,
      pii_policy: request.pii_policy,
      // Do NOT include stripped inputs in audit payload (may contain business_name which is not PII but is business data)
      // Per §3.4, PII is stripped, but we keep the shape minimal
    },
  });

  // Per §4.5: If we cannot emit the stage.started audit, we should not proceed
  if (!startedEmit.success) {
    return {
      outputs: {},
      model_run_id: modelRunId,
      tokens_in: 0,
      tokens_out: 0,
      failure: startedEmit.failure,
    };
  }

  // Build prompts
  const systemPrompt = SYSTEM_PROMPTS[request.reasoning_kind];
  const userPrompt = buildUserPrompt(request.reasoning_kind, strippedInputs);

  // Call model (OpenRouter or stub)
  const modelResponse = await callOpenRouter(env, {
    modelRoutingProfile: request.model_routing_profile,
    systemPrompt,
    userPrompt,
    modelRunId,
    adapter,
  });

  // Handle model failure
  if (modelResponse.failure) {
    // Emit stage.failed audit event (best effort, but we already have a failure)
    await emitAuditEvent(env, {
      tenant_id: request.tenant_id,
      plane: "linkbot",
      actor: { actor_kind: "bot", actor_id: "linkbot-reasoning" },
      action: "stage.failed",
      subject: {
        run_id: request.run_id,
        stage_id: request.stage_id,
      },
      payload: {
        failure: modelResponse.failure,
        reasoning_kind: request.reasoning_kind,
      },
    });

    return {
      outputs: {},
      model_run_id: modelRunId,
      tokens_in: modelResponse.tokensIn,
      tokens_out: modelResponse.tokensOut,
      failure: modelResponse.failure,
    };
  }

  // Parse model output
  const parsedOutput = parseModelOutput(request.reasoning_kind, modelResponse.text);

  // Check if parse returned a failure report
  if ("code" in parsedOutput && "plane" in parsedOutput) {
    const failure = parsedOutput as FailureReport;

    // Emit stage.failed audit event (best effort)
    await emitAuditEvent(env, {
      tenant_id: request.tenant_id,
      plane: "linkbot",
      actor: { actor_kind: "bot", actor_id: "linkbot-reasoning" },
      action: "stage.failed",
      subject: {
        run_id: request.run_id,
        stage_id: request.stage_id,
      },
      payload: {
        failure,
        reasoning_kind: request.reasoning_kind,
      },
    });

    return {
      outputs: {},
      model_run_id: modelRunId,
      tokens_in: modelResponse.tokensIn,
      tokens_out: modelResponse.tokensOut,
      failure,
    };
  }

  // Success: emit stage.completed audit event
  const completedEmit = await emitAuditEvent(env, {
    tenant_id: request.tenant_id,
    plane: "linkbot",
    actor: { actor_kind: "bot", actor_id: "linkbot-reasoning" },
    action: "stage.completed",
    subject: {
      run_id: request.run_id,
      stage_id: request.stage_id,
    },
    payload: {
      reasoning_kind: request.reasoning_kind,
      duration_ms: Date.now() - startTime,
      tokens_in: modelResponse.tokensIn,
      tokens_out: modelResponse.tokensOut,
      // Output shape keys only (not content) to keep audit lean
      output_keys: Object.keys(parsedOutput),
    },
  });

  // Per §4.5: If we cannot confirm stage.completed audit, the stage is not complete
  if (!completedEmit.success) {
    // We have outputs but no audit confirmation — kernel should retry
    return {
      outputs: parsedOutput,
      model_run_id: modelRunId,
      tokens_in: modelResponse.tokensIn,
      tokens_out: modelResponse.tokensOut,
      failure: completedEmit.failure,
    };
  }

  log("info", "Reasoning dispatch completed", {
    service: "bot-runtime",
    run_id: request.run_id,
    stage_id: request.stage_id,
    reasoning_kind: request.reasoning_kind,
    modelRunId,
    duration_ms: Date.now() - startTime,
  });

  return {
    outputs: parsedOutput,
    model_run_id: modelRunId,
    tokens_in: modelResponse.tokensIn,
    tokens_out: modelResponse.tokensOut,
  };
}
