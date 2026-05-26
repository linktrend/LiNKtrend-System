"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { LICENSEE_HOME_PATH } from "@/lib/app-surface";

function resolveDestination(nextPath: string, fallback: string, apiDestination?: string): string {
  if (apiDestination?.startsWith("/")) return apiDestination;
  if (nextPath.startsWith("/")) return nextPath;
  return fallback;
}

export function LoginForm(props: { defaultNext: string; legalAccepted: boolean }) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || props.defaultNext;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!props.legalAccepted) {
      setError("Accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const submittedEmail = String(formData.get("email") ?? email).trim();
      const submittedPassword = String(formData.get("password") ?? password);

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: submittedEmail, password: submittedPassword, next: nextPath }),
      });

      const body = (await loginRes.json()) as { destination?: string; error?: string };
      if (!loginRes.ok) {
        setError(body.error ?? "Sign in failed");
        return;
      }

      window.location.assign(resolveDestination(nextPath, props.defaultNext, body.destination));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form method="post" action="#" onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || !props.legalAccepted}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
