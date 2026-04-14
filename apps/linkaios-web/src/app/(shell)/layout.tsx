import { ShellLayout } from "@/components/shell-layout";
import {
  canWriteCommandCentre,
  getCommandCentreRoleForUser,
  isCommandCentreAdmin,
} from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ShellAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const commandCentreRole =
    user?.id != null
      ? await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email })
      : undefined;
  const canWrite =
    commandCentreRole != null ? canWriteCommandCentre(commandCentreRole) : undefined;
  const showAdminNav =
    user?.id != null ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }) : false;

  return (
    <ShellLayout
      showDevtools={process.env.NODE_ENV === "development"}
      userEmail={user?.email ?? null}
      commandCentreRole={commandCentreRole}
      canWrite={canWrite}
      showAdminNav={showAdminNav}
    >
      {children}
    </ShellLayout>
  );
}
