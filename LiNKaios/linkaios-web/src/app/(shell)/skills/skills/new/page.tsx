import Link from "next/link";

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
      <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Add Skill</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Creates a draft you can open to edit the prompt, tools, and files.
        </p>
      </header>
      <SkillCreateForm />
    </main>
  );
}
