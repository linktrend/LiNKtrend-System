import Link from "next/link";

import { LoginPageShell } from "@/components/auth/login-page-shell";
import { LICENSEE_LOGIN_PATH } from "@/lib/app-surface";

export default function LostAccessPage() {
  return (
    <LoginPageShell
      eyebrow="LiNKtrend"
      title="Lost Access"
      subtitle="Contact your organisation administrator or LiNKtrend support to restore sign-in access."
    >
      <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
        Email{" "}
        <a href="mailto:support@linktrend.com" className="font-medium text-sky-700 underline dark:text-sky-400">
          support@linktrend.com
        </a>{" "}
        from the address on your account, or ask an admin to reset your credentials.
      </p>
      <p className="mt-6">
        <Link
          href={LICENSEE_LOGIN_PATH}
          className="text-sm font-medium text-sky-700 underline dark:text-sky-400"
        >
          Back to login
        </Link>
      </p>
    </LoginPageShell>
  );
}
