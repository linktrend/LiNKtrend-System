import { NextResponse } from "next/server";

import { buildFleetV1DashboardSummary } from "@/lib/kernel/fleet/fleet-dashboard";

/**
 * GET /api/kernel/fleet/summary
 * Fleet v1 OpenClaw + Agent Zero lane summary for Admin dashboard (Wave 6.5).
 */
export async function GET() {
  const ramRaw = process.env.LINKAIOS_FLEET_RAM_NOTE_GB?.trim();
  const ramNoteGb = ramRaw ? Number.parseInt(ramRaw, 10) || 16 : 16;
  const hostLabel = process.env.LINKAIOS_FLEET_HOST_LABEL?.trim() || "linkdroplet-00 (DO launch)";

  const summary = buildFleetV1DashboardSummary({ ramNoteGb, hostLabel });
  return NextResponse.json({ ok: true, summary });
}
