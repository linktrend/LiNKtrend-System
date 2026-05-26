import Link from "next/link";

import { LOGIN_LEGAL_COPY } from "@/lib/login-legal-copy";
import { TYPE } from "@/lib/ui-standards";

export default function PrivacyPage() {
  const year = new Date().getFullYear();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/login" className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400">
        ← Back to sign in
      </Link>
      <h1 className={`mt-6 ${TYPE.pageTitle}`}>Privacy Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Development placeholder. Final privacy policy will describe what LiNKtrend collects, how tenant and operator
        data is stored, retention, subprocessors, and your rights. Replace this page before production launch.
      </p>
      <p className="mt-8 text-center text-xs text-zinc-500">{LOGIN_LEGAL_COPY.copyright(year)}</p>
    </div>
  );
}
