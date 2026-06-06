/**
 * Librarian bot mission execution (LTS-021).
 */

import type { BotReasonRequest } from "./local-types.js";
import type { BotSessionContext, MissionResult } from "./types.js";
import {
  attachWorldBrainContribution,
  anonymizeKnowledgeForWorldBrain,
  buildCompanyKnowledgeRecord,
  buildKnowledgeProposal,
  getKnowledgeProposal,
  reviewKnowledgeProposal,
  type KnowledgeProposal,
} from "./seams/librarian-knowledge-loop.js";
import { evaluateWorldBrainContribution } from "./seams/linkguard-world-brain.js";
import {
  emitAuditEvent,
  emitRoleCompleted,
  emitRoleStarted,
  type ContextAdapterConfig,
} from "./context-adapter.js";
import { sessionToMissionResult } from "./session.js";

type LibrarianInputs = {
  run_outputs?: Array<{ ref: string; summary: string }>;
  zulip_thread_refs?: Array<{ stream: string; topic: string; message_ids?: string[] }>;
  project_id?: string;
  auto_accept?: boolean;
  reviewed_by?: string;
};

function getLibrarianInputs(inputs: Record<string, unknown>): LibrarianInputs {
  const raw = inputs.librarian_ingest;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as LibrarianInputs;
  }
  return {
    run_outputs: Array.isArray(inputs.run_outputs)
      ? (inputs.run_outputs as LibrarianInputs["run_outputs"])
      : undefined,
    zulip_thread_refs: Array.isArray(inputs.zulip_thread_refs)
      ? (inputs.zulip_thread_refs as LibrarianInputs["zulip_thread_refs"])
      : undefined,
    project_id: typeof inputs.project_id === "string" ? inputs.project_id : undefined,
  };
}

async function emitMemoryProposed(
  request: BotReasonRequest,
  proposal: KnowledgeProposal,
  config?: ContextAdapterConfig,
): Promise<string | null> {
  const result = await emitAuditEvent(
    {
      tenant_id: request.tenant_id,
      plane: "linkbrain",
      actor: { actor_kind: "bot", actor_id: "librarian_bot" },
      action: "memory.proposed",
      subject: { run_id: request.run_id, stage_id: request.stage_id },
      payload: {
        proposal_id: proposal.proposal_id,
        memory_type: "linksites_accepted_knowledge",
        source_count: proposal.sources.length,
        title: proposal.title,
      },
      schema_version: "1",
    },
    config,
  );
  return result?.event_id ?? null;
}

async function emitMemoryAccepted(
  request: BotReasonRequest,
  knowledge_ref: string,
  world_brain_ref: string | undefined,
  config?: ContextAdapterConfig,
): Promise<string | null> {
  const result = await emitAuditEvent(
    {
      tenant_id: request.tenant_id,
      plane: "linkbrain",
      actor: { actor_kind: "system", actor_id: "linkbrain.librarian" },
      action: "memory.accepted",
      subject: { run_id: request.run_id, stage_id: request.stage_id },
      payload: {
        memory_type: "linksites_accepted_knowledge",
        accepted_ref: knowledge_ref,
        world_brain_ref: world_brain_ref ?? null,
      },
      schema_version: "1",
    },
    config,
  );
  return result?.event_id ?? null;
}

export async function executeLibrarianKnowledgeLoop(
  request: BotReasonRequest,
  session: BotSessionContext,
  config?: ContextAdapterConfig,
): Promise<MissionResult> {
  const ingest = getLibrarianInputs(request.inputs);

  const started = await emitRoleStarted(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    "librarian_bot",
    session.session_id,
    config,
  );
  if (started) {
    session.refs.audit_event_ids.push(started);
  }

  let proposal: KnowledgeProposal;
  try {
    const proposeUrl = process.env.LINKAIOS_LIBRARIAN_PROPOSE_URL?.trim();
    const proposeSecret =
      process.env.LINKAIOS_CRON_SECRET?.trim() ||
      process.env.BOT_BRAIN_API_SECRET?.trim() ||
      process.env.CRON_SECRET?.trim();

    if (proposeUrl && proposeSecret) {
      const response = await fetch(proposeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${proposeSecret}`,
        },
        body: JSON.stringify({
          tenant_id: request.tenant_id,
          run_id: request.run_id,
          stage_id: request.stage_id,
          project_id: ingest.project_id,
          run_outputs: ingest.run_outputs,
          zulip_thread_refs: ingest.zulip_thread_refs,
        }),
        signal: AbortSignal.timeout(config?.request_timeout_ms ?? 30_000),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Librarian propose failed (${response.status}): ${text.slice(0, 240)}`);
      }
      const payload = (await response.json()) as {
        proposal?: KnowledgeProposal;
        proposal_id?: string;
      };
      if (payload.proposal) {
        proposal = payload.proposal;
      } else {
        const proposalId =
          payload.proposal_id ??
          `librarian-proposal-${request.run_id}-${request.stage_id}`;
        proposal =
          getKnowledgeProposal(proposalId) ??
          buildKnowledgeProposal(
            {
              tenant_id: request.tenant_id,
              run_id: request.run_id,
              stage_id: request.stage_id,
              project_id: ingest.project_id,
              run_outputs: ingest.run_outputs,
              zulip_thread_refs: ingest.zulip_thread_refs,
            },
            { proposal_id: proposalId },
          );
      }
    } else {
      proposal = buildKnowledgeProposal({
        tenant_id: request.tenant_id,
        run_id: request.run_id,
        stage_id: request.stage_id,
        project_id: ingest.project_id,
        run_outputs: ingest.run_outputs,
        zulip_thread_refs: ingest.zulip_thread_refs,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Librarian ingest failed";
    return sessionToMissionResult(
      session,
      { status: "failed", reason: message },
      false,
      {
        code: "INTEGRATION_UNAVAILABLE",
        plane: "linkbot",
        message,
        retryable: false,
        occurred_at: new Date().toISOString(),
      },
    );
  }

  const proposedAudit = await emitMemoryProposed(request, proposal, config);
  if (proposedAudit) {
    session.refs.audit_event_ids.push(proposedAudit);
  }

  let knowledge_ref: string | undefined;
  let world_brain_ref: string | undefined;

  if (ingest.auto_accept) {
    const accepted = reviewKnowledgeProposal({
      proposal_id: proposal.proposal_id,
      decision: "accept",
      reviewed_by: ingest.reviewed_by ?? "policy:mvo-auto-accept",
    });
    const companyRecord = buildCompanyKnowledgeRecord(accepted);
    const guardCheck = evaluateWorldBrainContribution(companyRecord.payload);
    if (!guardCheck.allowed) {
      return sessionToMissionResult(
        session,
        { status: "blocked", reason: guardCheck.reason },
        false,
        {
          code: "POLICY_REQUIRES_APPROVAL",
          plane: "linkbrain",
          message: guardCheck.reason,
          retryable: false,
          occurred_at: new Date().toISOString(),
        },
      );
    }
    const world = anonymizeKnowledgeForWorldBrain(companyRecord);
    attachWorldBrainContribution(accepted, world);
    knowledge_ref = accepted.knowledge_ref;
    world_brain_ref = world.world_brain_ref;

    const acceptedAudit = await emitMemoryAccepted(
      request,
      knowledge_ref ?? accepted.knowledge_ref ?? proposal.proposal_id,
      world_brain_ref,
      config,
    );
    if (acceptedAudit) {
      session.refs.audit_event_ids.push(acceptedAudit);
    }
  }

  const completed = await emitRoleCompleted(
    request.tenant_id,
    request.run_id,
    request.stage_id,
    "librarian_bot",
    session.session_id,
    `librarian-${proposal.proposal_id}`,
    0,
    0,
    config,
  );
  if (completed) {
    session.refs.audit_event_ids.push(completed);
  }

  return sessionToMissionResult(
    session,
    {
      knowledge_proposal_ref: proposal.proposal_id,
      proposal_status: ingest.auto_accept ? "accepted" : "pending",
      knowledge_ref: knowledge_ref ?? null,
      world_brain_ref: world_brain_ref ?? null,
      sources: proposal.sources,
      inbox_path: `/memory?tab=inbox`,
    },
    true,
  );
}
