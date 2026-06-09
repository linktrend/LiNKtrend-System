import { CustomerServiceQueue } from "@/components/customer-service/customer-service-queue";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { loadSupportTicketsFromDb } from "@/lib/support-tickets-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerServicePage() {
  const supabase = await createSupabaseServerClient();
  const loaded = await loadSupportTicketsFromDb(supabase);

  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Customer Service"
        subtitle="Unified support ticket queue across licensees — governed by Chatwoot when the connector is live."
      />
      <CustomerServiceQueue
        initialTickets={loaded.tickets}
        queueMode={loaded.mode}
        tableReady={loaded.tableReady}
        loadError={loaded.loadError}
      />
    </main>
  );
}
