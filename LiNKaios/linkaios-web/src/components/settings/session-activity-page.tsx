"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Clock, Laptop, MapPin, MonitorSmartphone } from "lucide-react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TitledCardHeader } from "@/components/titled-card-header";
import {
  SESSION_ACTIVITY_COPY,
  SESSION_ACTIVITY_TABS,
  parseSessionActivityTab,
  sessionActivityEventLabel,
  sessionActivityTabHref,
  type SessionActivityTabId,
} from "@/lib/session-activity-copy";
import {
  demoActiveSessions,
  demoSessionHistory,
  formatRelativeActive,
  formatSessionTimestamp,
  type ActiveSessionRow,
} from "@/lib/ui-mocks/session-activity-demo";
import { BUTTON, screenTabLinkClass, TABS } from "@/lib/ui-standards";

function SessionActivityTabNav(props: { active: SessionActivityTabId }) {
  return (
    <nav className={TABS.row} aria-label="Session activity sections">
      {SESSION_ACTIVITY_TABS.map((tab) => (
        <Link key={tab.id} href={sessionActivityTabHref(tab.id)} className={screenTabLinkClass(props.active === tab.id)}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function ActiveSessionsPanel(props: { email: string; onFlash: (msg: string) => void }) {
  const [sessions, setSessions] = useState<ActiveSessionRow[]>(() => demoActiveSessions());

  const others = useMemo(() => sessions.filter((s) => !s.isCurrent), [sessions]);

  function revoke(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    props.onFlash(SESSION_ACTIVITY_COPY.revokeSuccess);
  }

  function signOutOthers() {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    props.onFlash(SESSION_ACTIVITY_COPY.signOutOthersSuccess);
  }

  return (
    <section className="space-y-4">
      <TitledCardHeader
        icon={MonitorSmartphone}
        title={SESSION_ACTIVITY_COPY.activeTitle}
        description={`Signed in as ${props.email}. ${SESSION_ACTIVITY_COPY.activeDescription}`}
        action={
          others.length > 0 ? (
            <button type="button" className={`${BUTTON.rejectCompact} shrink-0`} onClick={signOutOthers}>
              Sign out other sessions
            </button>
          ) : undefined
        }
      />

      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>Device</th>
              <th className={DT.thTextInset}>Browser</th>
              <th className={DT.thTextInset}>OS</th>
              <th className={DT.thTextInset}>Location</th>
              <th className={DT.thTextInset}>IP address</th>
              <th className={DT.thTextInset}>Last active</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>Action</div>
              </th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {sessions.map((row) => (
              <DataTableRow key={row.id} multiline>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{row.deviceLabel}</span>
                  {row.isCurrent ? (
                    <span className="mt-0.5 block text-xs font-medium text-emerald-700 dark:text-emerald-300">Current session</span>
                  ) : null}
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{row.browser}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{row.os}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>{row.location}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={`${DT.tdTextSpan} font-mono text-xs`}>{row.ipAddress}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{formatRelativeActive(row.lastActiveAt)}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">Since {formatSessionTimestamp(row.signedInAt)}</span>
                </td>
                <td className={DT.tdControl}>
                  <div className={DT.controlInner}>
                    {row.isCurrent ? (
                      <span className="text-xs text-zinc-400">—</span>
                    ) : (
                      <button type="button" className={BUTTON.rejectCompact} onClick={() => revoke(row.id)}>
                        Revoke
                      </button>
                    )}
                  </div>
                </td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}

function ActivityHistoryPanel() {
  const rows = useMemo(() => demoSessionHistory(), []);

  return (
    <section className="space-y-4">
      <TitledCardHeader icon={Clock} title={SESSION_ACTIVITY_COPY.historyTitle} description={SESSION_ACTIVITY_COPY.historyDescription} />

      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[24%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>When</th>
              <th className={DT.thTextInset}>Event</th>
              <th className={DT.thTextInset}>Device</th>
              <th className={DT.thTextInset}>Location</th>
              <th className={DT.thTextInset}>IP address</th>
              <th className={DT.thTextInset}>Details</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {rows.map((row) => (
              <DataTableRow key={row.id} multiline>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdTextSpan}>{formatSessionTimestamp(row.occurredAt)}</span>
                </td>
                <td className={`${DT.tdClipInset} font-medium text-zinc-900 dark:text-zinc-100`}>
                  <span className={DT.tdTextSpan}>{sessionActivityEventLabel(row.type)}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>{row.deviceLabel}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>{row.location}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={`${DT.tdTextSpan} font-mono text-xs`}>{row.ipAddress}</span>
                </td>
                <td className={DT.tdClipInset}>
                  <span className={DT.tdWrapSpan}>{row.detail}</span>
                </td>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}

export function SessionActivityPage(props: { email: string }) {
  const searchParams = useSearchParams();
  const activeTab = parseSessionActivityTab(searchParams.get("tab"));
  const [flash, setFlash] = useState<string | null>(null);

  function showFlash(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 5000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <span className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <Laptop className="h-4 w-4 text-zinc-500" aria-hidden />
          {props.email}
        </span>
        <span className="inline-flex items-center gap-2 text-zinc-500">
          <MapPin className="h-4 w-4" aria-hidden />
          Operator account activity only
        </span>
      </div>

      <SessionActivityTabNav active={activeTab} />

      {flash ? (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
          {flash}
        </p>
      ) : null}

      {activeTab === "active" ? <ActiveSessionsPanel email={props.email} onFlash={showFlash} /> : null}
      {activeTab === "history" ? <ActivityHistoryPanel /> : null}
    </div>
  );
}
