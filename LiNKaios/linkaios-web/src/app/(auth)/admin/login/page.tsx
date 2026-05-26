import { LoginPageShell } from "@/components/auth/login-page-shell";
import { AdminLoginPanel } from "@/components/auth/admin-login-panel";

export default function AdminLoginPage() {
  return (
    <LoginPageShell
      eyebrow="LiNKtrend Operator"
      title="LiNKaios Admin"
      subtitle="Sign in to the licensor command centre — licensees, platform settings, fleet governance, and operator tools."
    >
      <AdminLoginPanel />
    </LoginPageShell>
  );
}
