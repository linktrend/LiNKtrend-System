"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseLinks = [
  { href: "/", label: "Overview" },
  { href: "/workers", label: "Workers" },
  { href: "/gateway", label: "Gateway" },
  { href: "/traces", label: "Traces" },
] as const;

export function ShellNav(props: { showDevtools?: boolean }) {
  const pathname = usePathname() ?? "/";
  const links = [
    ...baseLinks,
    ...(props.showDevtools ? ([{ href: "/devtools/governance", label: "Gov JSON" }] as const) : []),
  ];

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-1 px-6 py-3">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={
                "rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900")
              }
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
