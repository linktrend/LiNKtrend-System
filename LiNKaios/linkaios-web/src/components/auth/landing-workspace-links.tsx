"use client";

import { ADMIN_BASE_PATH, ADMIN_LOGIN_PATH, LICENSEE_HOME_PATH, LICENSEE_LOGIN_PATH } from "@/lib/app-surface";
import { BUTTON } from "@/lib/ui-standards";

function userHref(signedIn: boolean): string {
  return signedIn ? LICENSEE_HOME_PATH : `${LICENSEE_LOGIN_PATH}?next=${encodeURIComponent(LICENSEE_HOME_PATH)}`;
}

function adminHref(signedIn: boolean): string {
  return signedIn ? ADMIN_BASE_PATH : `/admin/login?next=${encodeURIComponent(ADMIN_BASE_PATH)}`;
}

function go(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
  event.preventDefault();
  window.location.assign(href);
}

/** Workspace picker — always uses full page navigation (works without the Next.js client bundle). */
export function LandingWorkspaceLinks(props: { signedIn: boolean; variant?: "picker" | "open" }) {
  const { signedIn, variant = "picker" } = props;
  const userTarget = userHref(signedIn);
  const adminTarget = adminHref(signedIn);

  if (variant === "open") {
    return (
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={userTarget} onClick={(e) => go(e, userTarget)} className={BUTTON.primaryRow}>
          Open User workspace
        </a>
        <a href={adminTarget} onClick={(e) => go(e, adminTarget)} className={BUTTON.secondaryRow}>
          Open Admin
        </a>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-3">
      <a href={userTarget} onClick={(e) => go(e, userTarget)} className={BUTTON.primaryRow}>
        User
      </a>
      <a href={adminTarget} onClick={(e) => go(e, adminTarget)} className={BUTTON.secondaryRow}>
        Admin
      </a>
    </div>
  );
}
