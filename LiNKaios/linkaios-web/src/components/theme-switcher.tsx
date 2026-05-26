"use client";

import { useEffect, useState } from "react";

import {
  cycleTheme,
  EVENT_APPEARANCE_THEMES_CHANGED,
  getThemeIcon,
  readActiveThemeId,
  resolveThemeProfile,
} from "@/lib/appearance-themes";

const toolbarButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900";

function themeIconClass(iconId: string): string {
  if (iconId === "Sun") return "h-4 w-4 text-amber-400";
  if (iconId === "Moon") return "h-4 w-4 text-blue-500";
  return "h-4 w-4";
}

/** Single theme button — shows the active icon and cycles rotation themes on press. */
export function ThemeToggleButton() {
  const [activeId, setActiveId] = useState("light");

  useEffect(() => {
    const sync = () => setActiveId(readActiveThemeId());
    sync();
    window.addEventListener(EVENT_APPEARANCE_THEMES_CHANGED, sync);
    return () => window.removeEventListener(EVENT_APPEARANCE_THEMES_CHANGED, sync);
  }, []);

  const activeTheme = resolveThemeProfile(activeId);
  if (!activeTheme) return null;

  const Icon = getThemeIcon(activeTheme.icon);

  return (
    <button
      type="button"
      className={toolbarButtonClass}
      aria-label={`Cycle theme (currently ${activeTheme.name})`}
      title={`${activeTheme.name} — click to cycle themes`}
      onClick={() => cycleTheme()}
    >
      <Icon className={themeIconClass(activeTheme.icon)} aria-hidden />
    </button>
  );
}
