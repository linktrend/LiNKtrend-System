import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";

/** Lead LiNKbot name with icon-only navigation — no underlined text link. */
export function LeadLinkbotAffordance(props: { workerId: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{props.name}</span>
      <Link
        href={`/workers/${encodeURIComponent(props.workerId)}/sessions`}
        aria-label={`Open ${props.name} in LiNKbots`}
        title={`Open ${props.name} in LiNKbots`}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <SquareArrowOutUpRight className="h-4 w-4" aria-hidden />
      </Link>
    </span>
  );
}
