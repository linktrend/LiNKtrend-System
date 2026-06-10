import { linkaiosUiMocksEnabled } from "@linktrend/shared-config";

export type DataEnvironmentMode = "mock" | "live";

export type DataEnvironmentState = {
  showBadge: boolean;
  mode: DataEnvironmentMode;
};

export type ResolveDataEnvironmentOptions = {
  /** Admin hides the live/dev-stub strip; badge appears only when fixture mocks are enabled. */
  surface?: "admin" | "licensee";
};

function isTruthy(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

/** Local dev — Supabase health route accepts unreachable DB (see health/supabase route). */
export function isDevStubModeActive(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== "production" && isTruthy(env.LINKAIOS_SUPABASE_HEALTH_DEV_STUB);
}

/** Whether shell chrome should show Mock vs Live data badge. */
export function resolveDataEnvironment(
  env: NodeJS.ProcessEnv = process.env,
  options?: ResolveDataEnvironmentOptions,
): DataEnvironmentState {
  const mocks = linkaiosUiMocksEnabled(env);
  const devStub = isDevStubModeActive(env);

  if (options?.surface === "admin") {
    if (!mocks) return { showBadge: false, mode: "live" };
    return { showBadge: true, mode: "mock" };
  }

  if (!mocks && !devStub) {
    return { showBadge: false, mode: "live" };
  }
  return { showBadge: true, mode: mocks ? "mock" : "live" };
}
