/**
 * Column sizing for worker closed-session logs (11 columns).
 * Status and actions are separate control columns — matches sessions catalogue.
 */
import { DATA_TABLE } from "@/lib/ui-standards";

export const WORKER_SESSION_LOGS_TABLE_CLASS = DATA_TABLE.table;

export function WorkerSessionLogsColGroup() {
  return (
    <colgroup>
      <col className="w-[20%]" />
      <col className="w-[8%]" />
      <col className="w-[12%]" />
      <col className="w-[9%]" />
      <col className="w-[9%]" />
      <col className="w-[7%]" />
      <col className="w-[6%]" />
      <col className="w-[5%]" />
      <col className="w-[7%]" />
      <col className="w-[10%]" />
      <col className="w-[7%]" />
    </colgroup>
  );
}
