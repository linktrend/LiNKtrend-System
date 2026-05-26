"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { UiButton } from "@/components/ui/button-bridge";
import { cn } from "@/lib/utils";

export type WorkEmptyStateAction =
  | { kind: "link"; label: string; href: string; variant?: "primary" | "secondary" }
  | { kind: "button"; label: string; onClick: () => void; variant?: "primary" | "secondary" };

export function WorkEmptyState(props: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: WorkEmptyStateAction[];
  className?: string;
}) {
  const Icon = props.icon;

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/40",
        props.className,
      )}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{props.title}</p>
      {props.description ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{props.description}</p>
      ) : null}
      {props.actions?.length ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {props.actions.map((action) => {
            const buttonKey = action.variant === "secondary" ? "secondaryRow" : "addRow";
            if (action.kind === "link") {
              return (
                <UiButton key={`${action.href}-${action.label}`} asChild buttonKey={buttonKey}>
                  <Link href={action.href}>{action.label}</Link>
                </UiButton>
              );
            }
            return (
              <UiButton key={action.label} type="button" buttonKey={buttonKey} onClick={action.onClick}>
                {action.label}
              </UiButton>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
