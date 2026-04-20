import type { ReactNode } from "react";

/**
 * Primary lede under the route’s main title (top of the main column). Left sky accent; not for section / h2 subtitles.
 */
export function PageIntro(props: { children: ReactNode; className?: string }) {
  return (
    <aside
      aria-label="Introduction"
      className={
        "max-w-3xl border-l-4 border-sky-500 pl-3 text-sm leading-relaxed text-zinc-800 [&_code]:rounded [&_code]:bg-zinc-100/80 [&_code]:px-1 [&_code]:text-[11px] dark:border-sky-400 dark:text-zinc-200 dark:[&_code]:bg-zinc-800/80 " +
        (props.className ?? "")
      }
    >
      {props.children}
    </aside>
  );
}
