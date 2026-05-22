"use client";

import { useEffect, useState } from "react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TableBoolToggle } from "@/components/data-table/table-bool-toggle";
import {
  EVENT_NOTIFICATION_PREFERENCES_CHANGED,
  readNotificationPreferences,
  writeNotificationPreferences,
  type NotificationChannel,
  type NotificationPreferenceRow,
} from "@/lib/notification-preferences";
import { formatUiLabel } from "@/lib/ui-standards";

function ToggleCell(props: {
  row: NotificationPreferenceRow;
  channel: NotificationChannel;
  onChange: (rowId: string, channel: NotificationChannel, next: boolean) => void;
}) {
  const on = props.channel === "email" ? props.row.email : props.channel === "inApp" ? props.row.inApp : props.row.push;
  return (
    <td className={DT.tdControl}>
      <div className={DT.controlInner}>
        <TableBoolToggle
          on={on}
          ariaLabel={`${props.row.label} ${props.channel}`}
          onToggle={(next) => props.onChange(props.row.id, props.channel, next)}
        />
      </div>
    </td>
  );
}

export function NotificationSettingsPage() {
  const [rows, setRows] = useState<NotificationPreferenceRow[]>(() => readNotificationPreferences());
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setRows(readNotificationPreferences());
    sync();
    window.addEventListener(EVENT_NOTIFICATION_PREFERENCES_CHANGED, sync);
    return () => window.removeEventListener(EVENT_NOTIFICATION_PREFERENCES_CHANGED, sync);
  }, []);

  function updateChannel(rowId: string, channel: NotificationChannel, next: boolean) {
    const updated = rows.map((row) => {
      if (row.id !== rowId) return row;
      if (channel === "email") return { ...row, email: next };
      if (channel === "inApp") return { ...row, inApp: next };
      return { ...row, push: next };
    });
    setRows(updated);
    writeNotificationPreferences(updated);
    setFlash("Notification preferences saved.");
    window.setTimeout(() => setFlash(null), 3000);
  }

  return (
    <div className="space-y-6">
      {flash ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          {flash}
        </p>
      ) : null}

      <section className="space-y-4">
        <DataTableShell scrollableBody>
          <DataTable>
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[34%]" />
              <col className="w-[14%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Notification")}</th>
                <th className={DT.thTextInset}>{formatUiLabel("Description")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Email")}</div>
                </th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("In-app")}</div>
                </th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Push")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {rows.map((row) => (
                <DataTableRow key={row.id} multiline>
                  <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                    <span className={DT.tdTextSpan}>{formatUiLabel(row.label)}</span>
                  </td>
                  <td className={DT.tdClipInset}>
                    <span className={DT.tdWrapSpan}>{row.description}</span>
                  </td>
                  <ToggleCell row={row} channel="email" onChange={updateChannel} />
                  <ToggleCell row={row} channel="inApp" onChange={updateChannel} />
                  <ToggleCell row={row} channel="push" onChange={updateChannel} />
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}
