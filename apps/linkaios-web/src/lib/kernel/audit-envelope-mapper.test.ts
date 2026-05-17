import { describe, expect, it, vi } from "vitest";
import { writeBrainAuditEvent } from "@linktrend/linklogic-sdk";
import type { Env } from "@linktrend/shared-config";
import { mapToCanonicalAuditEnvelope, writeMappedAuditEnvelopeEvent } from "./audit-envelope-mapper";

vi.mock("@linktrend/linklogic-sdk", async () => {
  const actual = await vi.importActual<typeof import("@linktrend/linklogic-sdk")>("@linktrend/linklogic-sdk");
  return {
    ...actual,
    writeBrainAuditEvent: vi.fn(async (_env, event) => ({
      event_id: event.event_id,
      persisted: true,
    })),
  };
});

const env = {} as Env;

describe("mapToCanonicalAuditEnvelope", () => {
  it("maps LinkBot lifecycle signals to canonical run/stage actions", () => {
    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkbot",
        source_action: "run.dispatched",
        tenant_id: "tenant-1",
        run_id: "run-1",
      }),
    ).toMatchObject({ action: "run.started", subject: { run_id: "run-1" } });

    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkbot",
        source_action: "role.started",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "research_enrichment",
      }),
    ).toMatchObject({ action: "stage.started", subject: { run_id: "run-1", stage_id: "research_enrichment" } });

    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkbot",
        source_action: "role.completed",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "research_enrichment",
      }),
    ).toMatchObject({ action: "stage.completed" });

    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkbot",
        source_action: "role.failed",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "research_enrichment",
      }),
    ).toMatchObject({ action: "stage.failed" });
  });

  it("maps LinkSkills capability signals to canonical lease/stage actions", () => {
    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkskills",
        source_action: "capability.requested",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "plane_execution_tracking",
      }),
    ).toMatchObject({ action: "lease.requested" });

    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkskills",
        source_action: "capability.executed",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "plane_execution_tracking",
      }),
    ).toMatchObject({ action: "lease.executed" });

    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkskills",
        source_action: "capability.failed",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "plane_execution_tracking",
      }),
    ).toMatchObject({ action: "stage.failed" });
  });

  it("maps LiNKautowork workflow signals to canonical workflow actions", () => {
    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkautowork",
        source_action: "workflow.invoked",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "artifact_write_local",
      }),
    ).toMatchObject({ action: "workflow.invoked" });

    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkautowork",
        source_action: "workflow.completed",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "artifact_write_local",
      }),
    ).toMatchObject({ action: "workflow.completed" });

    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkautowork",
        source_action: "workflow.failed",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "artifact_write_local",
      }),
    ).toMatchObject({ action: "workflow.failed" });
  });

  it("maps linktrend governance lifecycle signals", () => {
    expect(
      mapToCanonicalAuditEnvelope({
        source_plane: "linkbot",
        source_action: "linktrend.gov.authorization.granted",
        tenant_id: "tenant-1",
        run_id: "run-1",
        stage_id: "research_enrichment",
      }),
    ).toMatchObject({ action: "approval.granted" });
  });
});

describe("writeMappedAuditEnvelopeEvent", () => {
  it("writes mapped event with run_id and stage_id preserved for trace queryability", async () => {
    await writeMappedAuditEnvelopeEvent(env, {
      source_plane: "linkautowork",
      source_action: "workflow.invoked",
      tenant_id: "tenant-1",
      run_id: "run-abc",
      stage_id: "preview_readiness_check",
      payload: { workflow_handle: "autowork.linksites.preview_readiness_check" },
    });

    expect(writeBrainAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "workflow.invoked",
        subject: expect.objectContaining({
          run_id: "run-abc",
          stage_id: "preview_readiness_check",
        }),
      }),
    );
  });

  it("returns null and does not write for unmapped source actions", async () => {
    const result = await writeMappedAuditEnvelopeEvent(env, {
      source_plane: "linkbot",
      source_action: "role.declared",
      tenant_id: "tenant-1",
      run_id: "run-1",
      stage_id: "research_enrichment",
    });

    expect(result).toBeNull();
    expect(writeBrainAuditEvent).toHaveBeenCalledTimes(1);
  });
});
