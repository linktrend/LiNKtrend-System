import { describe, expect, it } from "vitest";

import { withStripeProductManagementGovernance } from "@/lib/admin/stripe/governance";

describe("stripe governance wrapper", () => {
  it("returns lease and audit refs on success", async () => {
    const { result, governance } = await withStripeProductManagementGovernance(
      "stripe.product.create",
      { name: "Test" },
      async () => ({ id: "prod_test" }),
    );
    expect(result).toEqual({ id: "prod_test" });
    expect(governance.capability).toBe("cap.stripe.product_management");
    expect(governance.leaseId).toMatch(/^lease_stripe_/);
    expect(governance.auditEventId).toMatch(/^audit_stripe_/);
  });

  it("rethrows on failure", async () => {
    await expect(
      withStripeProductManagementGovernance("stripe.product.create", {}, async () => {
        throw new Error("stripe down");
      }),
    ).rejects.toThrow("stripe down");
  });
});
