import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { ToolCreateForm } from "@/components/tool-create-form";

export const dynamic = "force-dynamic";

export default function NewToolPage() {
  return (
    <main className="space-y-8">
      <div>
        <Link href="/skills/tools" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          ← Tools catalogue
        </Link>
      </div>
      <header className="border-b border-zinc-200 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Add tool</h1>
        <PageIntro className="mt-2 max-w-2xl">
          Register a new capability as <span className="font-medium">draft</span>. After creation, open the tool to set
          implementation details and approve it for publish/runtime controls.
        </PageIntro>
      </header>
      <ToolCreateForm />
    </main>
  );
}
