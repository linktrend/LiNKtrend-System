import { ShellLayout } from "@/components/shell-layout";
import { isUiMocksEnabled } from "@/lib/ui-mocks/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ShellAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const uiMocksEnabled = isUiMocksEnabled();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    <ShellLayout sidebarUser={sidebarUser} uiMocksEnabled={uiMocksEnabled}>
      {children}
    </ShellLayout>
  );
}
