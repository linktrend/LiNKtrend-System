"use server";

import { randomUUID } from "node:crypto";

import {
  appendBrainDailyLogLine,
  createBrainDraft,
  createBrainDraftFromPublishedIfAny,
  getBrainFileVersionById,
  getOrCreateBrainVirtualFile,
  getPublishedVersionForFile,
  insertBrainUploadRecord,
  listBrainIndexCardsForFile,
  publishBrainVersion,
  rejectBrainDraft,
  replaceChunksForVersion,
  replaceIndexCardsForFile,
  replaceOrgTagsForVirtualFile,
  updateBrainDraftBody,
  upsertBrainEmbedJobPending,
  type BrainFileKind,
  type BrainScope,
  type BrainSensitivity,
} from "@linktrend/linklogic-sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireWriter() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "You must be signed in." };
  const email = user.email ?? undefined;
  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email });
  if (!canWriteCommandCentre(role)) {
    return { supabase, user: null, error: "Command-centre role is read-only for this action." };
  }
  return { supabase, user, error: null as string | null };
}

export async function updateBrainDraftAction(versionId: string, body: string) {
  const { supabase, user, error } = await requireWriter();
  if (error || !user) return { ok: false as const, error: error ?? "unauthorized" };
  const { data: ver } = await getBrainFileVersionById(supabase, versionId);
  if (!ver || ver.status !== "draft") {
    return { ok: false as const, error: "Only open drafts can be edited here." };
  }
  const { data: fileMeta } = await supabase
    .schema("linkaios")
    .from("brain_virtual_files")
    .select("file_kind")
    .eq("id", ver.file_id)
    .maybeSingle();
  const fk = (fileMeta as { file_kind?: string } | null)?.file_kind;
  if (fk === "daily_log") {
    return { ok: false as const, error: "Daily logs are append-only in LiNKbrain; use runtime append APIs." };
  }
  const { error: uErr } = await updateBrainDraftBody(supabase, versionId, body);
  revalidatePath("/memory");
  revalidatePath(`/memory/drafts/${versionId}`);
  if (uErr) return { ok: false as const, error: uErr.message };
  return { ok: true as const, error: null as string | null };
}

export async function publishBrainDraftAction(versionId: string) {
  const { supabase, user, error } = await requireWriter();
  if (error || !user) return { ok: false as const, error: error ?? "unauthorized" };
  const { data: before } = await getBrainFileVersionById(supabase, versionId);
  const fileId = before?.file_id;
  const { error: pErr } = await publishBrainVersion(supabase, versionId);
  revalidatePath("/memory");
  revalidatePath(`/memory/drafts/${versionId}`);
  if (pErr) return { ok: false as const, error: pErr.message };
  if (fileId) {
    const { data: pub } = await getPublishedVersionForFile(supabase, fileId);
    if (pub?.id) {
      if (pub.body) {
        await replaceChunksForVersion(supabase, pub.id, pub.body);
      }
      await upsertBrainEmbedJobPending(supabase, pub.id);
    }
  }
  return { ok: true as const, error: null as string | null };
}

export async function saveBrainDraftFromForm(formData: FormData): Promise<void> {
  const versionId = String(formData.get("versionId") ?? "");
  const body = String(formData.get("body") ?? "");
  if (!versionId) return;
  await updateBrainDraftAction(versionId, body);
}

export async function publishBrainDraftFromForm(formData: FormData): Promise<void> {
  const versionId = String(formData.get("versionId") ?? "");
  if (!versionId) return;
  await publishBrainDraftAction(versionId);
}

/** Inbox list: publish then return to Inbox with query errors surfaced like reject flow. */
export async function publishBrainDraftFromInboxForm(formData: FormData): Promise<void> {
  const versionId = String(formData.get("versionId") ?? "").trim();
  if (!versionId) return;
  const r = await publishBrainDraftAction(versionId);
  if (!r.ok) {
    redirect(`/memory?tab=inbox&err=${encodeURIComponent(r.error ?? "Publish failed")}`);
  }
  redirect("/memory?tab=inbox");
}

function parseSensitivity(v: string): BrainSensitivity {
  if (v === "public" || v === "confidential" || v === "restricted") return v;
  return "internal";
}

function parseFileKind(v: string): BrainFileKind {
  if (v === "daily_log" || v === "upload" || v === "librarian" || v === "quick_note") return v;
  return "standard";
}

export async function rejectBrainDraftFromForm(formData: FormData): Promise<void> {
  const versionId = String(formData.get("versionId") ?? "").trim();
  if (!versionId) return;
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/memory?tab=inbox&err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const { error: rErr } = await rejectBrainDraft(supabase, versionId);
  revalidatePath("/memory");
  if (rErr) {
    redirect(`/memory?tab=inbox&err=${encodeURIComponent(rErr.message)}`);
  }
  redirect("/memory?tab=inbox");
}

export async function proposeEditFromPublishedForm(formData: FormData): Promise<void> {
  const fileId = String(formData.get("fileId") ?? "").trim();
  if (!fileId) return;
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const { data: draft, error: dErr } = await createBrainDraftFromPublishedIfAny(supabase, {
    fileId,
    createdBy: user.id,
  });
  revalidatePath("/memory");
  if (dErr || !draft) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(dErr?.message ?? "could not start proposal")}`);
  }
  redirect(`/memory/drafts/${draft.id}`);
}

export async function createQuickNoteDraftAction(formData: FormData): Promise<void> {
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/memory?tab=project&err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const scope = String(formData.get("scope") ?? "company") as BrainScope;
  const missionId = String(formData.get("missionId") ?? "").trim() || null;
  const agentId = String(formData.get("agentId") ?? "").trim() || null;
  const noteBody = String(formData.get("noteBody") ?? "").trim();
  const legalEntityId = String(formData.get("legalEntityId") ?? "").trim() || null;
  const sensitivity = parseSensitivity(String(formData.get("sensitivity") ?? "internal"));
  if (!noteBody) {
    redirect(`/memory?tab=${formData.get("returnTab") ?? "project"}&err=${encodeURIComponent("Note text is required")}`);
  }
  const logicalPath = `inbox/quick-${randomUUID()}.md`;
  const { data: file, error: fErr } = await getOrCreateBrainVirtualFile(supabase, {
    scope,
    logicalPath,
    missionId: scope === "mission" ? missionId : null,
    agentId: scope === "agent" ? agentId : null,
    legalEntityId,
    sensitivity,
    fileKind: "quick_note",
  });
  if (fErr || !file) {
    redirect(`/memory?tab=project&err=${encodeURIComponent(fErr?.message ?? "virtual file")}`);
  }
  const { data: draft, error: dErr } = await createBrainDraft(supabase, {
    fileId: file.id,
    body: noteBody,
    createdBy: user.id,
  });
  revalidatePath("/memory");
  if (dErr || !draft) {
    redirect(`/memory?tab=project&err=${encodeURIComponent(dErr?.message ?? "draft")}`);
  }
  redirect(`/memory/drafts/${draft.id}`);
}

export async function createBrainDraftFromPathAction(formData: FormData): Promise<void> {
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/memory/drafts/new?err=${encodeURIComponent(error ?? "unauthorized")}`);
  }

  const scope = String(formData.get("scope") ?? "company") as BrainScope;
  const logicalPath = String(formData.get("logicalPath") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const missionId = String(formData.get("missionId") ?? "").trim() || null;
  const agentId = String(formData.get("agentId") ?? "").trim() || null;
  const legalEntityId = String(formData.get("legalEntityId") ?? "").trim() || null;
  const sensitivity = parseSensitivity(String(formData.get("sensitivity") ?? "internal"));
  const fileKind = parseFileKind(String(formData.get("fileKind") ?? "standard"));

  if (!logicalPath) {
    redirect(`/memory/drafts/new?err=${encodeURIComponent("logicalPath is required")}`);
  }

  const { data: file, error: fErr } = await getOrCreateBrainVirtualFile(supabase, {
    scope,
    logicalPath,
    missionId: scope === "mission" ? missionId : null,
    agentId: scope === "agent" ? agentId : null,
    legalEntityId,
    sensitivity,
    fileKind,
  });
  if (fErr || !file) {
    redirect(`/memory/drafts/new?err=${encodeURIComponent(fErr?.message ?? "could not open virtual file")}`);
  }

  const { data: draft, error: dErr } = await createBrainDraft(supabase, {
    fileId: file.id,
    body,
    createdBy: user.id,
  });
  if (dErr || !draft) {
    redirect(`/memory/drafts/new?err=${encodeURIComponent(dErr?.message ?? "could not create draft")}`);
  }

  revalidatePath("/memory");
  redirect(`/memory/drafts/${draft.id}`);
}

export async function saveBrainFileOrgTagsFromForm(formData: FormData): Promise<void> {
  const fileId = String(formData.get("fileId") ?? "").trim();
  if (!fileId) return;
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const raw = formData.getAll("orgNodeId");
  const orgNodeIds = raw.map((v) => String(v).trim()).filter(Boolean);
  const { error: tErr } = await replaceOrgTagsForVirtualFile(supabase, fileId, orgNodeIds);
  revalidatePath("/memory");
  revalidatePath(`/memory/files/${fileId}`);
  if (tErr) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(tErr.message)}`);
  }
  redirect(`/memory/files/${fileId}`);
}

const UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
const UPLOAD_ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/markdown",
]);

function safeUploadFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(0, 120);
  return base || "upload.bin";
}

export async function uploadBrainBinaryFromForm(formData: FormData): Promise<void> {
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/memory?tab=project&err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const raw = formData.get("file");
  if (!(raw instanceof File) || raw.size === 0) {
    redirect(`/memory?tab=project&err=${encodeURIComponent("Choose a non-empty file.")}`);
  }
  if (raw.size > UPLOAD_MAX_BYTES) {
    redirect(`/memory?tab=project&err=${encodeURIComponent("File exceeds 25 MiB limit.")}`);
  }
  const mime = (raw.type || "application/octet-stream").split(";")[0]?.trim() ?? "application/octet-stream";
  if (!UPLOAD_ALLOWED_MIME.has(mime)) {
    redirect(`/memory?tab=project&err=${encodeURIComponent(`MIME type not allowed: ${mime}`)}`);
  }

  const scope = String(formData.get("scope") ?? "company") as BrainScope;
  const missionId = String(formData.get("missionId") ?? "").trim() || null;
  const agentId = String(formData.get("agentId") ?? "").trim() || null;
  const legalEntityId = String(formData.get("legalEntityId") ?? "").trim() || null;
  const sensitivity = parseSensitivity(String(formData.get("sensitivity") ?? "internal"));
  const returnTab = String(formData.get("returnTab") ?? "project");

  const admin = getSupabaseAdmin();
  const logicalPath = `uploads/${randomUUID()}-${safeUploadFilename(raw.name)}`;
  const objectPath = `${user.id}/${randomUUID()}-${safeUploadFilename(raw.name)}`;
  const buf = Buffer.from(await raw.arrayBuffer());
  const up = await admin.storage.from("brain-uploads").upload(objectPath, buf, {
    contentType: mime,
    upsert: false,
  });
  if (up.error) {
    redirect(
      `/memory?tab=${encodeURIComponent(returnTab)}&err=${encodeURIComponent(
        `Storage upload failed (${up.error.message}). Ensure bucket brain-uploads exists (see migrations/017).`,
      )}`,
    );
  }

  const { data: file, error: fErr } = await getOrCreateBrainVirtualFile(supabase, {
    scope,
    logicalPath,
    missionId: scope === "mission" ? missionId : null,
    agentId: scope === "agent" ? agentId : null,
    legalEntityId,
    sensitivity,
    fileKind: "upload",
  });
  if (fErr || !file) {
    await admin.storage.from("brain-uploads").remove([objectPath]);
    redirect(`/memory?tab=${encodeURIComponent(returnTab)}&err=${encodeURIComponent(fErr?.message ?? "virtual file")}`);
  }

  const { error: uoErr } = await insertBrainUploadRecord(supabase, {
    fileId: file.id,
    objectPath,
    byteSize: raw.size,
    mimeType: mime,
    virusScanStatus: "skipped",
  });
  if (uoErr) {
    redirect(`/memory?tab=${encodeURIComponent(returnTab)}&err=${encodeURIComponent(uoErr.message)}`);
  }

  const body = `# Binary upload (pending approval)\n\n- **Original name:** ${raw.name}\n- **MIME:** ${mime}\n- **Size:** ${raw.size} bytes\n- **Storage object:** \`${objectPath}\`\n\nApprove this draft after virus scanning policy is satisfied for your deployment.\n`;
  const { data: draft, error: dErr } = await createBrainDraft(supabase, {
    fileId: file.id,
    body,
    createdBy: user.id,
  });
  revalidatePath("/memory");
  if (dErr || !draft) {
    redirect(`/memory?tab=${encodeURIComponent(returnTab)}&err=${encodeURIComponent(dErr?.message ?? "draft")}`);
  }
  redirect(`/memory/drafts/${draft.id}`);
}

export async function appendBrainDailyLogFromForm(formData: FormData): Promise<void> {
  const fileId = String(formData.get("fileId") ?? "").trim();
  const agentId = String(formData.get("agentId") ?? "").trim();
  const logDate = String(formData.get("logDate") ?? "").trim();
  const line = String(formData.get("line") ?? "").trim();
  if (!fileId || !agentId || !logDate || !line) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent("Agent, date, and line text are required.")}`);
  }
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const { error: aErr } = await appendBrainDailyLogLine(supabase, {
    agentId,
    logDate,
    content: line,
    metadata: { source: "linkaios", user_id: user.id },
  });
  revalidatePath("/memory");
  revalidatePath(`/memory/files/${fileId}`);
  if (aErr) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(aErr.message)}`);
  }
  redirect(`/memory/files/${fileId}`);
}

export async function addBrainIndexCardFromForm(formData: FormData): Promise<void> {
  const fileId = String(formData.get("fileId") ?? "").trim();
  if (!fileId) return;
  const cardKey = String(formData.get("cardKey") ?? "").trim();
  const title = String(formData.get("cardTitle") ?? "").trim();
  const summary = String(formData.get("cardSummary") ?? "").trim();
  if (!cardKey || !title) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent("Card key and title are required.")}`);
  }
  const { supabase, user, error } = await requireWriter();
  if (error || !user) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(error ?? "unauthorized")}`);
  }
  const { data: existing, error: lErr } = await listBrainIndexCardsForFile(supabase, fileId);
  if (lErr) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(lErr.message)}`);
  }
  const cards = (existing ?? []).map((c, i) => ({
    card_key: c.card_key,
    title: c.title,
    summary: c.summary,
    ordinal: i,
    primary_chunk_id: c.primary_chunk_id,
  }));
  const nextOrd = cards.length;
  cards.push({
    card_key: cardKey,
    title,
    summary,
    ordinal: nextOrd,
    primary_chunk_id: null,
  });
  const { error: rErr } = await replaceIndexCardsForFile(supabase, fileId, cards);
  revalidatePath("/memory");
  revalidatePath(`/memory/files/${fileId}`);
  if (rErr) {
    redirect(`/memory/files/${fileId}?err=${encodeURIComponent(rErr.message)}`);
  }
  redirect(`/memory/files/${fileId}`);
}
