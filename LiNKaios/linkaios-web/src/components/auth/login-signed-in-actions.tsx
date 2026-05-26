import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { BUTTON } from "@/lib/ui-standards";

export function LoginSignedInActions(props: {
  workspaceHref: string;
  workspaceLabel: string;
  signOutRedirect: string;
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href={props.workspaceHref} className={BUTTON.primaryRow}>
        {props.workspaceLabel}
      </Link>
      <SignOutButton redirectTo={props.signOutRedirect} className={BUTTON.secondaryRow} />
    </div>
  );
}
