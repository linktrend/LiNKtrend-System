import { linkaiosUiMocksEnabled } from "@linktrend/shared-config";

/** UI fixture mode for LiNKaios (see `LINKAIOS_UI_MOCKS` in shared-config). Never on in production. */
export function isUiMocksEnabled(): boolean {
  return linkaiosUiMocksEnabled();
}

/** Admin surfaces never inject UI mocks — live data or empty states only. */
export function isAdminUiMocksEnabled(): boolean {
  return false;
}

/** UI review / dev — licensee accounts may open `/admin` without licensor bootstrap email. */
export function allowAdminSurfaceForReview(): boolean {
  if (isUiMocksEnabled()) return true;
  return process.env.NODE_ENV !== "production";
}
