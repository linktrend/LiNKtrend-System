import { describe, expect, it } from "vitest";

import { isDevStubModeActive, resolveDataEnvironment } from "@/lib/data-environment";

describe("data environment", () => {
  it("hides badge in production with mocks off and no dev stub", () => {
    expect(
      resolveDataEnvironment({
        NODE_ENV: "production",
        LINKAIOS_UI_MOCKS: "",
        LINKAIOS_SUPABASE_HEALTH_DEV_STUB: "",
      }),
    ).toEqual({ showBadge: false, mode: "live" });
  });

  it("shows mock badge when LINKAIOS_UI_MOCKS=1", () => {
    expect(
      resolveDataEnvironment({
        NODE_ENV: "development",
        LINKAIOS_UI_MOCKS: "1",
      }),
    ).toEqual({ showBadge: true, mode: "mock" });
  });

  it("shows live badge when dev stub active without mocks", () => {
    expect(
      resolveDataEnvironment({
        NODE_ENV: "development",
        LINKAIOS_UI_MOCKS: "",
        LINKAIOS_SUPABASE_HEALTH_DEV_STUB: "1",
      }),
    ).toEqual({ showBadge: true, mode: "live" });
  });

  it("hides badge on admin when mocks are off even with dev stub", () => {
    expect(
      resolveDataEnvironment(
        {
          NODE_ENV: "development",
          LINKAIOS_UI_MOCKS: "",
          LINKAIOS_SUPABASE_HEALTH_DEV_STUB: "1",
        },
        { surface: "admin" },
      ),
    ).toEqual({ showBadge: false, mode: "live" });
  });

  it("shows mock badge on admin only when LINKAIOS_UI_MOCKS=1 in non-production", () => {
    expect(
      resolveDataEnvironment(
        {
          NODE_ENV: "development",
          LINKAIOS_UI_MOCKS: "1",
        },
        { surface: "admin" },
      ),
    ).toEqual({ showBadge: true, mode: "mock" });
  });

  it("never shows mock badge on admin in production even if LINKAIOS_UI_MOCKS=1", () => {
    expect(
      resolveDataEnvironment(
        {
          NODE_ENV: "production",
          LINKAIOS_UI_MOCKS: "1",
        },
        { surface: "admin" },
      ),
    ).toEqual({ showBadge: false, mode: "live" });
  });

  it("detects dev stub only outside production", () => {
    expect(
      isDevStubModeActive({
        NODE_ENV: "production",
        LINKAIOS_SUPABASE_HEALTH_DEV_STUB: "1",
      }),
    ).toBe(false);
    expect(
      isDevStubModeActive({
        NODE_ENV: "development",
        LINKAIOS_SUPABASE_HEALTH_DEV_STUB: "true",
      }),
    ).toBe(true);
  });
});
