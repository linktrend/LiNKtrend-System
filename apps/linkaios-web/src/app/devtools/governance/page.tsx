import { notFound } from "next/navigation";

import { buildLinktrendGovernancePayload } from "@linktrend/linklogic-sdk";
import { loadEnv } from "@linktrend/shared-config";

export const dynamic = "force-dynamic";

export default async function GovernanceDevtoolsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const env = loadEnv();
  let body: string;
  try {
    const payload = await buildLinktrendGovernancePayload(env, {});
    body = JSON.stringify(payload, null, 2);
  } catch (e) {
    body = String(e);
  }

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">Governance JSON (development)</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Same object <code className="text-xs">bot-runtime</code> would send under{" "}
        <code className="text-xs">linktrendGovernance</code>. Not available in production builds.
      </p>
      <pre className="mt-6 max-h-[70vh] overflow-auto rounded-lg border border-zinc-200 bg-zinc-900 p-4 text-xs text-zinc-100">
        {body}
      </pre>
    </main>
  );
}
