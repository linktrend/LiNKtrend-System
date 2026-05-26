import { LoginPageShell } from "@/components/auth/login-page-shell";
import { LicenseeLoginPanel } from "@/components/auth/licensee-login-panel";
import { LoginSignedInActions } from "@/components/auth/login-signed-in-actions";
import { ADMIN_LOGIN_PATH, LICENSEE_HOME_PATH, LICENSEE_LOGIN_PATH } from "@/lib/app-surface";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LicenseeLoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedIn = Boolean(user?.id);

  return (
    <LoginPageShell
      eyebrow="LiNKtrend"
      title="LiNKaios"
      subtitle={
        signedIn
          ? undefined
          : "Sign in to your organisation workspace — missions, workers, memory, and day-to-day execution."
      }
      devAdminLoginHref={ADMIN_LOGIN_PATH}
    >
      {signedIn ? (
        <LoginSignedInActions
          workspaceHref={LICENSEE_HOME_PATH}
          workspaceLabel="User workspace"
          signOutRedirect={LICENSEE_LOGIN_PATH}
        />
      ) : (
        <LicenseeLoginPanel />
      )}
    </LoginPageShell>
  );
}
