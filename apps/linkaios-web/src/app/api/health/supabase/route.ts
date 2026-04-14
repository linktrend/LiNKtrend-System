import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        code: error.code,
        message: error.message,
        hint:
          error.code === "PGRST106"
            ? "Expose schemas linkaios,bot_runtime,prism,gateway in Supabase API settings, and run ALL_IN_ONE.sql if tables are missing."
            : undefined,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    linkaios_agents_count: count ?? 0,
  });
}
