import type { SupabaseClient } from "@supabase/supabase-js";

export type BrainUploadObjectRow = {
  id: string;
  file_id: string;
  bucket: string;
  object_path: string;
  byte_size: number;
  mime_type: string;
  sha256: string | null;
  virus_scan_status: string;
  created_at: string;
};

export async function insertBrainUploadRecord(
  client: SupabaseClient,
  params: {
    fileId: string;
    objectPath: string;
    byteSize: number;
    mimeType: string;
    virusScanStatus: "pending" | "skipped" | "passed" | "failed";
    bucket?: string;
  },
): Promise<{ error: Error | null }> {
  const { error } = await client.schema("linkaios").from("brain_upload_objects").insert({
    file_id: params.fileId,
    bucket: params.bucket ?? "brain-uploads",
    object_path: params.objectPath,
    byte_size: params.byteSize,
    mime_type: params.mimeType,
    virus_scan_status: params.virusScanStatus,
  });
  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export async function getBrainUploadByFileId(
  client: SupabaseClient,
  fileId: string,
): Promise<{ data: BrainUploadObjectRow | null; error: Error | null }> {
  const { data, error } = await client
    .schema("linkaios")
    .from("brain_upload_objects")
    .select("*")
    .eq("file_id", fileId)
    .maybeSingle();
  if (error) return { data: null, error: new Error(error.message) };
  return { data: (data ?? null) as BrainUploadObjectRow | null, error: null };
}
