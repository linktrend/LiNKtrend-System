import Link from "next/link";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { ToolCreateForm } from "@/components/tool-create-form";

export const dynamic = "force-dynamic";

export default function NewToolPage() {
  return (
    <main className="space-y-8">
      <div>
        <Link href="/skills/tools" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          ← Tools catalogue
        </Link>
      </div>
      <ShellPageHeaderClient
        title="Add Tool"
        subtitle="Register a new capability as draft — then open the tool to set implementation details and publish controls."
      />
      <ToolCreateForm />
    </main>
  );
}
