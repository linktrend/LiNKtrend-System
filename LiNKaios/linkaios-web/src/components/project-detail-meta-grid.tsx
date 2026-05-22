import type { ReactNode } from "react";

export type ProjectDetailMetaItem = {
  label: string;
  value: ReactNode;
};

/** Four-up project summary row — Project ID, Suite, Module, Lead LiNKbot. */
export function ProjectDetailMetaGrid(props: { items: ProjectDetailMetaItem[] }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {props.items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
