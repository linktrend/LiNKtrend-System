import { linkaiosUiMocksEnabled } from "@linktrend/shared-config";

/** UI fixture mode for LiNKaios (see `LINKAIOS_UI_MOCKS` in shared-config). */
export function isUiMocksEnabled(): boolean {
  return linkaiosUiMocksEnabled();
}
