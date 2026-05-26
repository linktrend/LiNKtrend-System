import { LoginPageShell } from "@/components/auth/login-page-shell";
import { LicenseeLoginPanel } from "@/components/auth/licensee-login-panel";
import { ADMIN_LOGIN_PATH } from "@/lib/app-surface";

export default function LicenseeLoginPage() {
  return (
    <LoginPageShell
      eyebrow="LiNKtrend"
      title="LiNKaios"
      subtitle="Sign in to your organisation workspace — missions, workers, memory, and day-to-day execution."
      devAdminLoginHref={ADMIN_LOGIN_PATH}
    >
      <LicenseeLoginPanel />
    </LoginPageShell>
  );
}
