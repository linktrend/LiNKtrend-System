import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900">LiNKaios sign in</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Use your Supabase Auth account (same project as this command centre). Enable Email provider
        in the dashboard if you have not already.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-zinc-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
