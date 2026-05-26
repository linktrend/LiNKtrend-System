import type { ModuleSubscriptionRecord } from "@/hooks/use-module-subscriptions";

/** MVO demo — seeds My Suites with each subscription pill state until localStorage overrides. */
export function fixtureMyModulesSubscriptionDemo(): Record<string, ModuleSubscriptionRecord> {
  const activePreviewEnds = new Date();
  activePreviewEnds.setDate(activePreviewEnds.getDate() + 18);

  const expiredPreviewEnds = new Date();
  expiredPreviewEnds.setDate(expiredPreviewEnds.getDate() - 12);

  const cancelledAt = new Date();
  cancelledAt.setDate(cancelledAt.getDate() - 90);

  return {
    linkapps: {
      mode: "preview",
      previewEndsAt: activePreviewEnds.toISOString(),
      subscribedAt: null,
    },
    "lexos-litigation": {
      mode: "preview",
      previewEndsAt: expiredPreviewEnds.toISOString(),
      subscribedAt: null,
    },
    marketing: {
      mode: "cancelled",
      previewEndsAt: null,
      subscribedAt: cancelledAt.toISOString(),
    },
  };
}
