"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ToolType } from "@linktrend/shared-types";

import { createTool } from "@/app/(shell)/skills/tools/actions";
import { TOOL_TYPE_LABELS } from "@/lib/tools-admin";

const TYPES: ToolType[] = ["executable_bundle", "http", "registry_reference", "plugin", "mcp_server"];

function defaultImplJson(t: ToolType): string {
  const o: Record<ToolType, unknown> = {
    executable_bundle: { artifact_uri: "", checksum_sha256: null, notes: "" },
    http: { base_url: "", notes: "" },
    registry_reference: { registry_url: "", package_name: "", version_constraint: ">=1.0.0" },
    plugin: { plugin_id: "", channel: "" },
    mcp_server: { command: "", args: [] as string[], notes: "" },
  };
  return JSON.stringify(o[t], null, 2);
}

export function ToolCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [toolType, setToolType] = useState<ToolType>("http");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [implJson, setImplJson] = useState(() => defaultImplJson("http"));

  useEffect(() => {
    setImplJson(defaultImplJson(toolType));
  }, [toolType]);

  function submit() {
    setErr(null);
    let implementation: Record<string, unknown>;
    try {
      implementation = JSON.parse(implJson) as Record<string, unknown>;
      if (typeof implementation !== "object" || implementation === null || Array.isArray(implementation)) {
        setErr("Implementation must be a JSON object.");
        return;
      }
    } catch {
      setErr("Implementation must be valid JSON.");
      return;
    }
    startTransition(() => {
      void (async () => {
        const r = await createTool({
          name,
          tool_type: toolType,
          category,
          description,
          implementation,
        });
        if (!r.ok) {
          setErr("error" in r ? r.error : "Could not create tool.");
          return;
        }
        router.push(`/skills/tools/${r.id}`);
        router.refresh();
      })();
    });
  }

  return (
    <div className="max-w-2xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-800">Tool type</label>
        <select
          value={toolType}
          disabled={pending}
          onChange={(e) => setToolType(e.target.value as ToolType)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {TOOL_TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-800">Name (slug)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          placeholder="e.g. my-http-tool"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
        />
        <p className="text-xs text-zinc-500">Lowercase letters, digits, and hyphens only.</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-800">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={pending}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-800">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={pending}
          rows={4}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-800">Implementation (JSON)</label>
        <textarea
          value={implJson}
          onChange={(e) => setImplJson(e.target.value)}
          disabled={pending}
          rows={12}
          spellCheck={false}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs"
        />
        <p className="text-xs text-zinc-500">
          Type-specific fields (URLs, artifact paths, MCP command, etc.). You can edit this again after the tool is created.
        </p>
      </div>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <button
        type="button"
        disabled={pending || !name.trim()}
        onClick={submit}
        className="inline-flex min-h-10 min-w-[7.5rem] items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create draft"}
      </button>
    </div>
  );
}
