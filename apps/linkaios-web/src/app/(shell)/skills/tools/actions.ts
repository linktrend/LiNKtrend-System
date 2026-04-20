"use server";

import { revalidatePath } from "next/cache";

import type { ToolRecord, ToolType } from "@linktrend/shared-types";

import { mergeToolMetadata } from "@/lib/tools-admin";
import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$/;

async function assertWriter() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { supabase, ok: false as const, error: "Not signed in." };
  }
  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email });
  if (!canWriteCommandCentre(role)) {
    return { supabase, ok: false as const, error: "Read-only: command centre writes are not allowed for your role." };
  }
  return { supabase, ok: true as const, error: undefined };
}

async function loadTool(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, id: string) {
  const { data, error } = await supabase.schema("linkaios").from("tools").select("*").eq("id", id).maybeSingle();
  if (error) return { tool: null as ToolRecord | null, error: error.message };
  return { tool: (data ?? null) as ToolRecord | null, error: null as string | null };
}

export type ToolActionResult = { ok: true } | { ok: false; error: string };

export async function getToolForEditor(toolId: string): Promise<{ tool: ToolRecord | null; error: string | null }> {
  if (!UUID_RE.test(toolId)) return { tool: null, error: "Invalid id" };
  const supabase = await createSupabaseServerClient();
  const { tool, error } = await loadTool(supabase, toolId);
  return { tool, error };
}

export type CreateToolResult = { ok: true; id: string } | { ok: false; error: string };

export async function createTool(input: {
  name: string;
  tool_type: ToolType;
  category: string;
  description: string;
  implementation: Record<string, unknown>;
}): Promise<CreateToolResult> {
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const name = input.name.trim().toLowerCase();
  if (!NAME_RE.test(name)) {
    return {
      ok: false,
      error: "Name must be lowercase letters, digits, hyphens; 1–64 chars; cannot start/end with hyphen.",
    };
  }
  const { data, error } = await gate.supabase
    .schema("linkaios")
    .from("tools")
    .insert({
      name,
      tool_type: input.tool_type,
      category: input.category.trim() || "General",
      description: input.description.trim(),
      implementation: input.implementation ?? {},
      status: "draft",
      version: 1,
      metadata: {
        linkaios_admin: { published: false, runtime_enabled: false },
      },
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "A tool with this name already exists." };
    return { ok: false, error: error.message };
  }
  const id = String((data as { id: string }).id);
  revalidatePath("/skills/tools");
  revalidatePath("/skills");
  return { ok: true, id };
}

export async function updateToolPublishFlags(
  toolId: string,
  published: boolean,
  runtimeEnabled: boolean,
): Promise<ToolActionResult> {
  if (!UUID_RE.test(toolId)) return { ok: false, error: "Invalid tool id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { tool, error } = await loadTool(gate.supabase, toolId);
  if (error) return { ok: false, error };
  if (!tool) return { ok: false, error: "Tool not found." };
  if (tool.status !== "approved") {
    return { ok: false, error: "Publish and runtime can only be changed for approved tools." };
  }
  let runtime = runtimeEnabled;
  if (!published) runtime = false;
  const nextMeta = mergeToolMetadata(tool.metadata ?? {}, { published, runtime_enabled: runtime });
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("tools")
    .update({ metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills/tools");
  revalidatePath(`/skills/tools/${toolId}`);
  revalidatePath("/skills");
  return { ok: true };
}

export async function updateToolDetails(
  toolId: string,
  input: { category?: string; description?: string },
): Promise<ToolActionResult> {
  if (!UUID_RE.test(toolId)) return { ok: false, error: "Invalid tool id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { tool, error } = await loadTool(gate.supabase, toolId);
  if (error) return { ok: false, error };
  if (!tool) return { ok: false, error: "Tool not found." };
  if (tool.status === "archived") return { ok: false, error: "Archived tools cannot be edited." };
  const patch: Record<string, unknown> = {};
  if (input.category != null) patch.category = input.category.trim() || "General";
  if (input.description != null) patch.description = input.description.trim();
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("tools")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills/tools");
  revalidatePath(`/skills/tools/${toolId}`);
  revalidatePath("/skills");
  return { ok: true };
}

export async function updateToolImplementation(toolId: string, implementation: Record<string, unknown>): Promise<ToolActionResult> {
  if (!UUID_RE.test(toolId)) return { ok: false, error: "Invalid tool id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { tool, error } = await loadTool(gate.supabase, toolId);
  if (error) return { ok: false, error };
  if (!tool) return { ok: false, error: "Tool not found." };
  if (tool.status === "archived") return { ok: false, error: "Archived tools cannot be edited." };
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("tools")
    .update({ implementation, updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills/tools");
  revalidatePath(`/skills/tools/${toolId}`);
  revalidatePath("/skills");
  return { ok: true };
}

export async function approveTool(toolId: string): Promise<ToolActionResult> {
  if (!UUID_RE.test(toolId)) return { ok: false, error: "Invalid tool id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { tool, error } = await loadTool(gate.supabase, toolId);
  if (error) return { ok: false, error };
  if (!tool) return { ok: false, error: "Tool not found." };
  if (tool.status !== "draft") return { ok: false, error: "Only draft tools can be approved." };
  const nextMeta = mergeToolMetadata(tool.metadata ?? {}, {
    published: true,
    runtime_enabled: false,
  });
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("tools")
    .update({ status: "approved", metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills/tools");
  revalidatePath(`/skills/tools/${toolId}`);
  revalidatePath("/skills");
  return { ok: true };
}

export async function archiveTool(toolId: string): Promise<ToolActionResult> {
  if (!UUID_RE.test(toolId)) return { ok: false, error: "Invalid tool id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { tool, error } = await loadTool(gate.supabase, toolId);
  if (error) return { ok: false, error };
  if (!tool) return { ok: false, error: "Tool not found." };
  if (tool.status === "archived") return { ok: false, error: "Tool is already archived." };
  const nextMeta = mergeToolMetadata(tool.metadata ?? {}, { published: false, runtime_enabled: false });
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("tools")
    .update({ status: "archived", metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills/tools");
  revalidatePath(`/skills/tools/${toolId}`);
  revalidatePath("/skills");
  return { ok: true };
}

export async function deleteTool(toolId: string): Promise<ToolActionResult> {
  if (!UUID_RE.test(toolId)) return { ok: false, error: "Invalid tool id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { tool, error } = await loadTool(gate.supabase, toolId);
  if (error) return { ok: false, error };
  if (!tool) return { ok: false, error: "Tool not found." };
  if (tool.status !== "draft") {
    return { ok: false, error: "Only draft tools that were never approved can be deleted. Archive approved tools instead." };
  }
  const { error: delErr } = await gate.supabase.schema("linkaios").from("tools").delete().eq("id", toolId);
  if (delErr) return { ok: false, error: delErr.message };
  revalidatePath("/skills/tools");
  revalidatePath("/skills");
  return { ok: true };
}

export async function restoreTool(toolId: string): Promise<ToolActionResult> {
  if (!UUID_RE.test(toolId)) return { ok: false, error: "Invalid tool id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { tool, error } = await loadTool(gate.supabase, toolId);
  if (error) return { ok: false, error };
  if (!tool) return { ok: false, error: "Tool not found." };
  if (tool.status !== "archived") return { ok: false, error: "Only archived tools can be restored." };
  const nextMeta = mergeToolMetadata(tool.metadata ?? {}, { published: false, runtime_enabled: false });
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("tools")
    .update({ status: "approved", metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills/tools");
  revalidatePath(`/skills/tools/${toolId}`);
  revalidatePath("/skills");
  return { ok: true };
}
