import type { LucideIcon } from "lucide-react";
import {
  Droplets,
  Flame,
  Leaf,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";

import type { ThemeChoice } from "@/components/theme-root";

export type ThemeIconId = "Sun" | "Moon" | "Palette" | "Sparkles" | "Leaf" | "Flame" | "Droplets" | "Zap";

export type ThemeProfile = {
  id: string;
  name: string;
  icon: ThemeIconId;
  appearance: ThemeChoice;
  builtIn?: boolean;
};

export const THEME_ICON_OPTIONS: { id: ThemeIconId; label: string }[] = [
  { id: "Sun", label: "Sun" },
  { id: "Moon", label: "Moon" },
  { id: "Palette", label: "Palette" },
  { id: "Sparkles", label: "Sparkles" },
  { id: "Leaf", label: "Leaf" },
  { id: "Flame", label: "Flame" },
  { id: "Droplets", label: "Droplets" },
  { id: "Zap", label: "Zap" },
];

const ICON_MAP: Record<ThemeIconId, LucideIcon> = {
  Sun,
  Moon,
  Palette,
  Sparkles,
  Leaf,
  Flame,
  Droplets,
  Zap,
};

export const BUILTIN_THEMES: ThemeProfile[] = [
  { id: "light", name: "Light", icon: "Sun", appearance: "light", builtIn: true },
  { id: "dark", name: "Dark", icon: "Moon", appearance: "dark", builtIn: true },
];

const STORAGE_CUSTOM = "linkaios-custom-themes-v1";
const STORAGE_ACTIVE = "linkaios-active-theme-id";
const STORAGE_ROTATION = "linkaios-theme-rotation-v1";
export const EVENT_APPEARANCE_THEMES_CHANGED = "linkaios-appearance-themes-changed";

const DEFAULT_ROTATION_IDS = BUILTIN_THEMES.map((theme) => theme.id);

export function getThemeIcon(icon: ThemeIconId): LucideIcon {
  return ICON_MAP[icon];
}

export function readCustomThemes(): ThemeProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_CUSTOM);
    if (!raw) return [];
    return JSON.parse(raw) as ThemeProfile[];
  } catch {
    return [];
  }
}

export function writeCustomThemes(themes: ThemeProfile[]) {
  window.localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(themes));
  window.dispatchEvent(new Event(EVENT_APPEARANCE_THEMES_CHANGED));
}

export function listAllThemes(): ThemeProfile[] {
  return [...BUILTIN_THEMES, ...readCustomThemes()];
}

export function readRotationThemeIds(): string[] {
  if (typeof window === "undefined") return DEFAULT_ROTATION_IDS;
  try {
    const raw = window.localStorage.getItem(STORAGE_ROTATION);
    if (!raw) return normalizeRotationIds(DEFAULT_ROTATION_IDS);
    return normalizeRotationIds(JSON.parse(raw) as string[]);
  } catch {
    return normalizeRotationIds(DEFAULT_ROTATION_IDS);
  }
}

function normalizeRotationIds(ids: string[]): string[] {
  const ordered = new Set<string>(DEFAULT_ROTATION_IDS);
  for (const id of ids) {
    if (resolveThemeProfileFromLists(id)) ordered.add(id);
  }
  const all = listAllThemes();
  return all.map((theme) => theme.id).filter((id) => ordered.has(id));
}

function resolveThemeProfileFromLists(themeId: string): ThemeProfile | undefined {
  return [...BUILTIN_THEMES, ...readCustomThemes()].find((theme) => theme.id === themeId);
}

export function writeRotationThemeIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_ROTATION, JSON.stringify(normalizeRotationIds(ids)));
  window.dispatchEvent(new Event(EVENT_APPEARANCE_THEMES_CHANGED));
}

export function isThemeInRotation(themeId: string): boolean {
  return readRotationThemeIds().includes(themeId);
}

export function listRotationThemes(): ThemeProfile[] {
  return readRotationThemeIds()
    .map((id) => resolveThemeProfile(id))
    .filter((theme): theme is ThemeProfile => theme != null);
}

export function addThemeToRotation(themeId: string) {
  if (!resolveThemeProfile(themeId)) return;
  const next = readRotationThemeIds();
  if (next.includes(themeId)) return;
  writeRotationThemeIds([...next, themeId]);
}

export function removeThemeFromRotation(themeId: string) {
  if (BUILTIN_THEMES.some((theme) => theme.id === themeId)) return;
  writeRotationThemeIds(readRotationThemeIds().filter((id) => id !== themeId));
}

export function setThemeInRotation(themeId: string, included: boolean) {
  if (included) addThemeToRotation(themeId);
  else removeThemeFromRotation(themeId);
}

export function cycleTheme() {
  const rotation = listRotationThemes();
  if (rotation.length === 0) return;
  const activeId = readActiveThemeId();
  const idx = rotation.findIndex((theme) => theme.id === activeId);
  const next = rotation[(idx + 1) % rotation.length] ?? rotation[0];
  activateTheme(next.id);
}

export function readActiveThemeId(): string {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(STORAGE_ACTIVE) ?? resolveLegacyActiveThemeId();
}

function resolveLegacyActiveThemeId(): string {
  const legacy = window.localStorage.getItem("linkaios-theme");
  if (legacy === "dark") return "dark";
  if (legacy === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveThemeProfile(themeId: string): ThemeProfile | undefined {
  return listAllThemes().find((theme) => theme.id === themeId);
}

export function activateTheme(themeId: string) {
  const profile = resolveThemeProfile(themeId);
  if (!profile) return;
  window.localStorage.setItem(STORAGE_ACTIVE, themeId);
  window.localStorage.setItem("linkaios-theme", profile.appearance);
  document.documentElement.classList.toggle("dark", profile.appearance === "dark");
  window.dispatchEvent(new Event(EVENT_APPEARANCE_THEMES_CHANGED));
}

export function appearanceSummaryLine(): string {
  const active = resolveThemeProfile(readActiveThemeId());
  if (!active) return "Light";
  const customCount = readCustomThemes().length;
  return customCount > 0 ? `${active.name} · ${customCount} custom` : active.name;
}

export function createCustomTheme(input: { name: string; icon: ThemeIconId; appearance: ThemeChoice }): ThemeProfile {
  return {
    id: `theme_${Date.now()}`,
    name: input.name.trim() || "Custom theme",
    icon: input.icon,
    appearance: input.appearance,
  };
}
