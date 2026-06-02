import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "@linktrend/shared-config";

import { createProjectStream, sendStreamMessage } from "./zulip-api.js";
import { loadZulipGatewayConfigFromEnv, zulipLiveReady } from "./load-config.js";
import type { ZulipGatewayConfig } from "./types.js";

export type ProjectZulipBootstrapInput = {
  projectId: string;
  projectTitle: string;
  tenantId: string;
  suiteId?: string | null;
  phaseStageIds?: string[];
};

export type ProjectZulipBootstrapResult = {
  bootstrapped: boolean;
  stream_name: string;
  stream_id: number;
  topics: string[];
  welcome_message_id?: number;
  reason?: string;
};

const GENERAL_TOPIC = "general";

/** Sanitize project title into a Zulip stream name (max 60 chars). */
export function projectStreamName(projectId: string, projectTitle: string): string {
  const slug = projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = projectId.replace(/-/g, "").slice(0, 8);
  const base = slug ? `project-${slug}` : "project";
  return `${base}-${suffix}`.slice(0, 60);
}

/** Map LiNKaios phase stage id to a Zulip topic label. */
export function phaseTopicName(stageId: string): string {
  const short = stageId.replace(/^linksites\./, "").replace(/\./g, "-");
  return `phase-${short}`.slice(0, 60);
}

function defaultPhaseTopics(suiteId?: string | null, phaseStageIds?: string[]): string[] {
  const topics = new Set<string>([GENERAL_TOPIC, "run-status"]);
  if (suiteId === "linksites" || !suiteId) {
    const stages = phaseStageIds?.length
      ? phaseStageIds
      : [
          "linksites.lead_generation",
          "linksites.qualification",
          "linksites.template_selection",
          "linksites.website_build",
          "linksites.publish",
          "linksites.outreach",
          "linksites.close_or_recycle",
        ];
    for (const stageId of stages) {
      topics.add(phaseTopicName(stageId));
    }
  }
  return [...topics];
}

async function upsertStreamRouting(
  client: SupabaseClient,
  streamId: number,
  projectId: string,
  note: string,
): Promise<void> {
  const { error } = await client
    .schema("gateway")
    .from("stream_routing")
    .upsert(
      {
        zulip_stream_id: streamId,
        mission_id: projectId,
        note,
      },
      { onConflict: "zulip_stream_id" },
    );
  if (error) {
    throw new Error(`stream_routing upsert failed: ${error.message}`);
  }
}

/**
 * Create project stream, seed topics with a welcome post, and register stream routing.
 * No-op when Zulip is not in live mode or credentials are missing.
 */
export async function bootstrapProjectZulip(
  env: Env,
  client: SupabaseClient,
  input: ProjectZulipBootstrapInput,
  configOverride?: ZulipGatewayConfig,
): Promise<ProjectZulipBootstrapResult> {
  if (!zulipLiveReady(env)) {
    return {
      bootstrapped: false,
      stream_name: projectStreamName(input.projectId, input.projectTitle),
      stream_id: 0,
      topics: defaultPhaseTopics(input.suiteId, input.phaseStageIds),
      reason: "zulip_not_live_or_missing_credentials",
    };
  }

  const config = configOverride ?? loadZulipGatewayConfigFromEnv(env);
  const streamName = projectStreamName(input.projectId, input.projectTitle);
  const topics = defaultPhaseTopics(input.suiteId, input.phaseStageIds);

  const stream = await createProjectStream(
    config,
    streamName,
    `LiNKaios project ${input.projectTitle} (${input.projectId})`,
  );

  await upsertStreamRouting(
    client,
    stream.stream_id,
    input.projectId,
    `auto-bootstrap tenant=${input.tenantId}`,
  );

  const welcome = await sendStreamMessage(config, {
    stream: stream.name,
    topic: GENERAL_TOPIC,
    content: [
      `**Project stream ready** — ${input.projectTitle}`,
      "",
      `- Project id: \`${input.projectId}\``,
      `- Tenant: \`${input.tenantId}\``,
      `- Topics: ${topics.map((t) => `\`${t}\``).join(", ")}`,
      "",
      "Reply in this stream to reach LiNKbots on this project.",
    ].join("\n"),
  });

  return {
    bootstrapped: true,
    stream_name: stream.name,
    stream_id: stream.stream_id,
    topics,
    welcome_message_id: welcome.id,
  };
}
