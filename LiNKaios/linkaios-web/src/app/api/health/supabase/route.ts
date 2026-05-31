import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function isTruthy(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export async function GET() {
  const isDevStubMode =
    process.env.NODE_ENV !== "production" && isTruthy(process.env.LINKAIOS_SUPABASE_HEALTH_DEV_STUB);

  try {
    const supabase = getSupabaseAdmin();
    const { error, count } = await supabase
      .schema("linkaios")
      .from("agents")
      .select("*", { count: "exact", head: true });

    if (error) {
      if (isDevStubMode) {
        return NextResponse.json({
          ok: true,
          mode: "dev_stub_ready",
          reason: "Supabase is unreachable in local development; health route stub enabled.",
        });
      }

      return NextResponse.json(
        {
          ok: false,
          code: error.code,
          message: error.message,
          hint:
            error.code === "PGRST106"
              ? "Expose schemas linkaios,bot_runtime,linkguard,gateway in Supabase API settings, and run ALL_IN_ONE.sql if tables are missing."
              : undefined,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      linkaios_agents_count: count ?? 0,
    });
  } catch (error) {
    if (isDevStubMode) {
      return NextResponse.json({
        ok: true,
        mode: "dev_stub_ready",
        reason: "Supabase is unreachable in local development; health route stub enabled.",
      });
    }

    const message = error instanceof Error ? error.message : "Unknown Supabase health failure";
    return NextResponse.json({ ok: false, message }, { status: 503 });
  }
}
