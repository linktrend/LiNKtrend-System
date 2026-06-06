import { StatusPill } from "@/components/ui/status-pill";

export function ProductRunStatusPill(props: { status: string }) {
  const tone =
    props.status.startsWith("blocked_") || props.status.startsWith("awaiting_")
      ? "warning"
      : props.status === "launched" || props.status === "operating"
        ? "success"
        : "neutral";

  return <StatusPill label={props.status.replaceAll("_", " ")} tone={tone} />;
}
