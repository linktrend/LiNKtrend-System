import { NextResponse } from "next/server";

import {
  createAdminProjectPersisted,
  parseCreateAdminProjectRequest,
} from "@/lib/admin-project-create";
import { CreateProjectError } from "@/lib/projects/types";

/** POST /api/admin/projects — vendor-scoped project create (licensor tenant). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  try {
    const input = parseCreateAdminProjectRequest(body);
    const result = await createAdminProjectPersisted(input);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof CreateProjectError) {
      return NextResponse.json(
        { error: err.message, details: err.details ?? [] },
        { status: err.status },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
