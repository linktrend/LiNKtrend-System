import { ShellLayout } from "@/components/shell-layout";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ShellAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ShellLayout
      showDevtools={process.env.NODE_ENV === "development"}
      userEmail={user?.email ?? null}
    >
      {children}
    </ShellLayout>
  );
}
