import { randomUUID } from "node:crypto";
import { createServer } from "node:http";

import { log } from "@linktrend/observability";

const port = Number(process.env.OPENCLAW_SHIM_PORT ?? 8789);

createServer(async (req, res) => {
  if (req.url === undefined) {
    res.writeHead(400);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "openclaw-shim" }));
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = { parse_error: true, preview: raw.slice(0, 400) };
  }

  const keys = parsed && typeof parsed === "object" && parsed !== null ? Object.keys(parsed as object) : [];
  log("info", "openclaw-shim ingress", {
    service: "openclaw-shim",
    path: req.url,
    topLevelKeys: keys,
    hasGovernance:
      typeof parsed === "object" &&
      parsed !== null &&
      "linktrendGovernance" in (parsed as Record<string, unknown>),
  });

  res.writeHead(200, { "content-type": "application/json" });
  res.end(
    JSON.stringify({
      ok: true,
      shim: true,
      runId: randomUUID(),
      receivedKeys: keys,
    }),
  );
}).listen(port, () => {
  log("info", "openclaw-shim listening", { service: "openclaw-shim", port });
});
