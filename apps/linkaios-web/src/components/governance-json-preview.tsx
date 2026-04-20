import { buildLinktrendGovernancePayload } from "@linktrend/linklogic-sdk";
import { loadEnv } from "@linktrend/shared-config";

export async function GovernanceJsonPreview() {
  const env = loadEnv();
  let body: string;
  try {
    const { payload, block } = await buildLinktrendGovernancePayload(env, {});
    body = JSON.stringify({ payload, block: block ?? null }, null, 2);
  } catch (e) {
    body = String(e);
  }

  return (
    <>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Same object <code className="rounded bg-zinc-100 px-1 text-[11px] dark:bg-zinc-800">bot-runtime</code> would send under{" "}
        <code className="rounded bg-zinc-100 px-1 text-[11px] dark:bg-zinc-800">linktrendGovernance</code>. Not available in
        production builds.
      </p>
      <pre className="mt-6 max-h-[70vh] overflow-auto rounded-lg border border-zinc-200 bg-zinc-900 p-4 text-xs text-zinc-100">
        {body}
      </pre>
    </>
  );
}
