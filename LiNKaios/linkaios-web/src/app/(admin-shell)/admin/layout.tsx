import { ShellLayout } from "@/components/shell-layout";
import { RolePreviewProvider } from "@/components/role-preview-provider";
import { resolveDataEnvironment } from "@/lib/data-environment";
import { getAppRoleTierForUser } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = false;
  const dataEnvironment = resolveDataEnvironment(process.env, { surface: "admin" });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const initialRole = user?.id
    ? await getAppRoleTierForUser(supabase, { userId: user.id, email: user.email })
    : undefined;
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const pickStr = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const sidebarUser = user
    ? {
        email: user.email ?? null,
        displayName: pickStr(meta?.full_name) ?? pickStr(meta?.name) ?? null,
        avatarUrl: pickStr(meta?.avatar_url),
      }
    : null;

  return (
    <RolePreviewProvider surface="admin" initialRole={initialRole}>
      <ShellLayout sidebarUser={sidebarUser} uiMocksEnabled={uiMocksEnabled} dataEnvironment={dataEnvironment} surface="admin">
        {children}
      </ShellLayout>
    </RolePreviewProvider>
  );
}
