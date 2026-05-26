export type RetentionDays = "90" | "180" | "365" | "730";

export type DataSettingsPreferences = {
  eventRetentionDays: RetentionDays;
  traceRetentionDays: RetentionDays;
  automaticBackups: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupRetentionCount: number;
  notifyOnBackup: boolean;
};

export type BackupHistoryRow = {
  id: string;
  createdAt: string;
  kind: "scheduled" | "manual";
  status: "completed" | "failed";
  sizeLabel: string;
};

export const RETENTION_OPTIONS: { value: RetentionDays; label: string }[] = [
  { value: "90", label: "90 days (default)" },
  { value: "180", label: "180 days" },
  { value: "365", label: "1 year" },
  { value: "730", label: "2 years" },
];

export const DEFAULT_DATA_SETTINGS: DataSettingsPreferences = {
  eventRetentionDays: "90",
  traceRetentionDays: "180",
  automaticBackups: true,
  backupFrequency: "weekly",
  backupRetentionCount: 8,
  notifyOnBackup: true,
};

const STORAGE_KEY = "linkaios-data-settings-v1";
const BACKUP_HISTORY_KEY = "linkaios-backup-history-v1";
export const EVENT_DATA_SETTINGS_CHANGED = "linkaios-data-settings-changed";

export function readDataSettings(): DataSettingsPreferences {
  if (typeof window === "undefined") return DEFAULT_DATA_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA_SETTINGS;
    return { ...DEFAULT_DATA_SETTINGS, ...(JSON.parse(raw) as Partial<DataSettingsPreferences>) };
  } catch {
    return DEFAULT_DATA_SETTINGS;
  }
}

export function writeDataSettings(next: DataSettingsPreferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_DATA_SETTINGS_CHANGED));
}

export function readBackupHistory(): BackupHistoryRow[] {
  if (typeof window === "undefined") return demoBackupHistory();
  try {
    const raw = window.localStorage.getItem(BACKUP_HISTORY_KEY);
    if (!raw) return demoBackupHistory();
    return JSON.parse(raw) as BackupHistoryRow[];
  } catch {
    return demoBackupHistory();
  }
}

export function appendBackupHistory(row: BackupHistoryRow) {
  const next = [row, ...readBackupHistory()].slice(0, 12);
  window.localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_DATA_SETTINGS_CHANGED));
}

function demoBackupHistory(): BackupHistoryRow[] {
  const now = Date.now();
  return [
    {
      id: "bk_demo_1",
      createdAt: new Date(now - 86400000 * 2).toISOString(),
      kind: "scheduled",
      status: "completed",
      sizeLabel: "42 MB",
    },
    {
      id: "bk_demo_2",
      createdAt: new Date(now - 86400000 * 9).toISOString(),
      kind: "scheduled",
      status: "completed",
      sizeLabel: "41 MB",
    },
  ];
}

export function retentionLabel(days: RetentionDays): string {
  return RETENTION_OPTIONS.find((opt) => opt.value === days)?.label ?? `${days} days`;
}

export function dataSettingsSummaryLines(prefs: DataSettingsPreferences): { retention: string; backups: string } {
  return {
    retention: `Events — ${retentionLabel(prefs.eventRetentionDays)}`,
    backups: prefs.automaticBackups ? `Backups — ${prefs.backupFrequency}` : "Backups — manual only",
  };
}
