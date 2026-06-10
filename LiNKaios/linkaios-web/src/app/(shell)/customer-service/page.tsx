import { CustomerServiceQueue } from "@/components/customer-service/customer-service-queue";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { getChatwootOperatorConfig } from "@/lib/chatwoot-operator-config.server";
import { loadSupportTicketsFromDb } from "@/lib/support-tickets-db.server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerServicePage() {
  const supabase = await createSupabaseServerClient();
  const loaded = await loadSupportTicketsFromDb(supabase);
  const chatwoot = getChatwootOperatorConfig();

  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Customer Service"
        subtitle="Dashboard mirror of Chatwoot — work happens in Chatwoot; this queue reflects live ticket status."
      />
      <CustomerServiceQueue
        initialTickets={loaded.tickets}
        queueMode={loaded.mode}
        tableReady={loaded.tableReady}
        loadError={loaded.loadError}
        chatwootSyncReady={loaded.chatwootSyncReady}
        chatwootSyncError={loaded.chatwootSyncError}
        chatwootPublicUrl={chatwoot.publicUrl}
        chatwootAccountId={chatwoot.accountId}
      />
    </main>
  );
}
