"use client";

import { WorkInboxModal } from "@/components/work-inbox-modal";
import { stripeProductDashboardUrl } from "@/lib/admin/stripe/dashboard-url";

export function StripeOpenModal(props: {
  open: boolean;
  onClose: () => void;
  productId: string | null;
  productName: string;
  dashboardMode: "test" | "live";
}) {
  const { open, onClose, productId, productName, dashboardMode } = props;
  const dashboardUrl = productId
    ? stripeProductDashboardUrl(productId, dashboardMode === "test")
    : null;

  return (
    <WorkInboxModal
      open={open}
      onClose={onClose}
      title="Open in Stripe Dashboard"
      subtitle={productName}
      actions={
        dashboardUrl
          ? [
              { label: "Cancel", variant: "secondary" },
              {
                label: "Open in Stripe ↗",
                variant: "primary",
                onClick: () => {
                  window.open(dashboardUrl, "_blank", "noopener,noreferrer");
                },
              },
            ]
          : [{ label: "Close", variant: "secondary" }]
      }
    >
      {dashboardUrl ? (
        <p>
          Routine catalog work stays in LiNKaios Admin. Use Stripe Dashboard for finance break-glass — disputes,
          tax registration, manual credits, and reconciliation. Product ID{" "}
          <code className="text-xs">{productId}</code>.
        </p>
      ) : (
        <p>No Stripe product selected.</p>
      )}
    </WorkInboxModal>
  );
}
