"use client";

import { useLayoutEffect } from "react";

export type ThemeChoice = "light" | "dark";

function resolveInitial(): ThemeChoice {
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

function applyTheme(choice: ThemeChoice) {
  document.documentElement.classList.toggle("dark", choice === "dark");
}

export function ThemeRoot(props: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    applyTheme(resolveInitial());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "linkaios-theme" && (e.newValue === "light" || e.newValue === "dark")) {
        applyTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <>{props.children}</>;
}

export function setThemeChoice(choice: ThemeChoice) {
  window.localStorage.setItem("linkaios-theme", choice);
  applyTheme(choice);
}
