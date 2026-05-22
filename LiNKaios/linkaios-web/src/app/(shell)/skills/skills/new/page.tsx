import Link from "next/link";

import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { SkillCreateForm } from "@/components/skill-create-form";

export const dynamic = "force-dynamic";

export default function NewSkillPage() {
  return (
    <main className="space-y-8">
      <div>
        <Link href="/skills/skills" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          ← Skills catalogue
        </Link>
      </div>
      <ShellPageHeaderClient
        title="Add Skill"
        subtitle="Creates a draft you can open to edit the prompt, tools, and files."
      />
      <SkillCreateForm />
    </main>
  );
}
