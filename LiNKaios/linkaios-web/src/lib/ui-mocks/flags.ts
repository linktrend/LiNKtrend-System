import { linkaiosUiMocksEnabled } from "@linktrend/shared-config";

import type { AppSurface } from "@/lib/app-surface";

/** UI fixture mode for LiNKaios (see `LINKAIOS_UI_MOCKS` in shared-config). Never on in production. */
export function isUiMocksEnabled(): boolean {
  return linkaiosUiMocksEnabled();
}

/** Admin never uses UI fixtures — live integration data or empty states only. */
export function isUiMocksEnabledForSurface(surface: AppSurface): boolean {
  if (surface === "admin") return false;
  return isUiMocksEnabled();
}

/** @deprecated Use `isUiMocksEnabledForSurface("admin")` — always false. */
export function isAdminUiMocksEnabled(): boolean {
  return false;
}

/** UI review / dev — licensee accounts may open `/admin` without licensor bootstrap email. */
export function allowAdminSurfaceForReview(): boolean {
  if (isUiMocksEnabled()) return true;
  return process.env.NODE_ENV !== "production";
}
