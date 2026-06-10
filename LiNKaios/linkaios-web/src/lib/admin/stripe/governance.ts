export type StripeGovernanceRefs = {
  capability: "cap.stripe.product_management";
  leaseId: string;
  auditEventId: string;
};

/**
 * Wrap Stripe catalog writes with LinkSkills lease + LiNKbrain audit stubs.
 * Full lease persistence ships with live billing; this records governed side-effect intent.
 */
export async function withStripeProductManagementGovernance<T>(
  action: string,
  payload: Record<string, unknown>,
  execute: () => Promise<T>,
): Promise<{ result: T; governance: StripeGovernanceRefs }> {
  const leaseId = `lease_stripe_${crypto.randomUUID()}`;
  const auditEventId = `audit_stripe_${crypto.randomUUID()}`;

  console.info("[cap.stripe.product_management] lease.requested", {
    action,
    leaseId,
    auditEventId,
    payload,
  });

  try {
    const result = await execute();
    console.info("[cap.stripe.product_management] lease.executed", {
      action,
      leaseId,
      auditEventId,
    });
    return {
      result,
      governance: {
        capability: "cap.stripe.product_management",
        leaseId,
        auditEventId,
      },
    };
  } catch (err) {
    console.error("[cap.stripe.product_management] lease.failed", {
      action,
      leaseId,
      auditEventId,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
