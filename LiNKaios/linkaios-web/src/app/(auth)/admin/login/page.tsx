import { AdminLoginPanel } from "@/components/auth/admin-login-panel";
import { LoginPageShell } from "@/components/auth/login-page-shell";
import { LoginSignedInActions } from "@/components/auth/login-signed-in-actions";
import { ADMIN_BASE_PATH, ADMIN_LOGIN_PATH } from "@/lib/app-surface";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedIn = Boolean(user?.id);

  return (
    <LoginPageShell
      eyebrow="LiNKtrend Operator"
      title="LiNKaios Admin"
      subtitle={
        signedIn
          ? undefined
          : "Sign in to the licensor command centre — licensees, platform settings, fleet governance, and operator tools."
      }
      devAdminLoginHref={undefined}
    >
      {signedIn ? (
        <LoginSignedInActions
          workspaceHref={ADMIN_BASE_PATH}
          workspaceLabel="Admin workspace"
          signOutRedirect={ADMIN_LOGIN_PATH}
        />
      ) : (
        <AdminLoginPanel />
      )}
    </LoginPageShell>
  );
}
