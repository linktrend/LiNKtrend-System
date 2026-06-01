import { describe, expect, it } from "vitest";

import { recordCloseOrRecycle } from "./close-recycle.js";

describe("LinkSites close or recycle (LTS-107)", () => {
  it("records subscribe outcome", () => {
    const record = recordCloseOrRecycle({
      tenant_id: "tenant-1",
      run_id: "run-1",
      outcome: "subscribe",
    });

    expect(record.outcome).toBe("subscribe");
  });

  it("records recycle outcome for unsold site", () => {
    const record = recordCloseOrRecycle({
      tenant_id: "tenant-1",
      run_id: "run-1",
      outcome: "recycle",
    });

    expect(record.outcome).toBe("recycle");
  });
});
