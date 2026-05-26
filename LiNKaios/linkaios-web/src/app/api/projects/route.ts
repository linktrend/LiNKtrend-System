import { NextResponse } from "next/server";

import { createProjectStub, parseCreateProjectRequest } from "@/lib/projects/create-project";
import { CreateProjectError } from "@/lib/projects/types";

/**
 * POST /api/projects
 *
 * Pre-wiring create contract — stub registers an in-memory demo project today.
 * Replace handler body with Supabase insert + Plane bootstrap when wiring lands.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  try {
    const input = parseCreateProjectRequest(body);
    const result = createProjectStub(input);
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
