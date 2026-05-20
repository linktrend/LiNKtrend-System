"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { setThemeChoice, type ThemeChoice } from "@/components/theme-root";

function readMode(): ThemeChoice {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem("linkaios-theme");
  if (v === "light" || v === "dark") return v;
  if (v === "system") {
    const next = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    window.localStorage.setItem("linkaios-theme", next);
    return next;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeSwitcher(props: { compact?: boolean }) {
  const [mode, setMode] = useState<ThemeChoice>("light");

  useEffect(() => {
    setMode(readMode());
  }, []);

  function pick(next: ThemeChoice) {
    setMode(next);
    setThemeChoice(next);
  }

  return (
    <div
      className={
        props.compact
          ? "flex w-full items-center justify-between px-2 py-1"
          : "mb-2 flex w-full items-center justify-between px-2 py-1.5"
      }
    >
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Theme</span>
      <div className="flex shrink-0 items-center gap-0.5" role="group" aria-label="Theme">
        <button
          type="button"
          onClick={() => pick("light")}
          aria-pressed={mode === "light"}
          aria-label="Sun appearance"
          className={`p-1.5 text-amber-600 outline-none transition dark:text-amber-400 ${
            mode === "light" ? "opacity-100" : "opacity-45 hover:opacity-80"
          }`}
        >
          <Sun className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => pick("dark")}
          aria-pressed={mode === "dark"}
          aria-label="Moon appearance"
          className={`p-1.5 text-sky-800 outline-none transition dark:text-sky-300 ${
            mode === "dark" ? "opacity-100" : "opacity-45 hover:opacity-80"
          }`}
        >
          <Moon className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
