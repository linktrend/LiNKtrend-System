import { linkaiosUiMocksEnabled } from "@linktrend/shared-config";

/** UI fixture mode for LiNKaios (see `LINKAIOS_UI_MOCKS` in shared-config). */
export function isUiMocksEnabled(): boolean {
  return linkaiosUiMocksEnabled();
}

/** UI review / dev — licensee accounts may open `/admin` without licensor bootstrap email. */
export function allowAdminSurfaceForReview(): boolean {
  if (isUiMocksEnabled()) return true;
  return process.env.NODE_ENV !== "production";
}
