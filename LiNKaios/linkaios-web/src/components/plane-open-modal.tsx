"use client";

import { WorkInboxModal } from "@/components/work-inbox-modal";

export function PlaneOpenModal(props: {
  open: boolean;
  onClose: () => void;
  planeHref: string | null;
  projectTitle: string;
}) {
  const { open, onClose, planeHref, projectTitle } = props;

  return (
    <WorkInboxModal
      open={open}
      onClose={onClose}
      title="Open in Plane"
      subtitle={projectTitle}
      actions={
        planeHref
          ? [
              { label: "Cancel", variant: "secondary" },
              {
                label: "Open in Plane ↗",
                variant: "primary",
                onClick: () => {
                  window.open(planeHref, "_blank", "noopener,noreferrer");
                },
              },
            ]
          : [{ label: "Close", variant: "secondary" }]
      }
    >
      {planeHref ? (
        <p>
          Plane is the execution kitchen for this program. Confirm context here, then open Plane in a new tab. LiNKaios
          keeps governance traces and status — detailed issue editing stays in Plane.
        </p>
      ) : (
        <p>
          Plane is not connected for this workspace. Set <code className="text-xs">NEXT_PUBLIC_PLANE_URL</code> (and
          workspace slug when required) to enable governed Plane links.
        </p>
      )}
    </WorkInboxModal>
  );
}
