import { NextResponse } from "next/server";

function authorizeCron(req: Request): boolean {
  const secrets = [process.env.LINKAIOS_CRON_SECRET, process.env.CRON_SECRET].filter(Boolean) as string[];
  if (!secrets.length) return false;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return Boolean(token && secrets.includes(token));
}

/**
 * Librarian cron hook (Phase B). Authenticated like other internal cron routes; extend with SDK work when wired.
 */
export async function POST(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    processed: 0,
    message: "Librarian endpoint reachable — no queued work in this build.",
  });
}

export async function GET(req: Request) {
  return POST(req);
}
