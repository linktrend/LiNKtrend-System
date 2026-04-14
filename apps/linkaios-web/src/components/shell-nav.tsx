"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseLinks = [
  { href: "/", label: "Overview" },
  { href: "/missions", label: "Missions" },
  { href: "/skills", label: "Skills" },
  { href: "/memory", label: "Memory" },
  { href: "/workers", label: "Workers" },
  { href: "/gateway", label: "Gateway" },
  { href: "/traces", label: "Traces" },
] as const;

export function ShellNav(props: { showDevtools?: boolean; showAdminNav?: boolean }) {
  const pathname = usePathname() ?? "/";
  const links = [
    ...baseLinks,
    ...(props.showAdminNav ? ([{ href: "/admin/access", label: "Admin" }] as const) : []),
    ...(props.showDevtools ? ([{ href: "/devtools/governance", label: "Gov JSON" }] as const) : []),
  ];

  return (
    <nav className="flex flex-wrap gap-1">
      {links.map((l) => {
        const active =
          l.href === "/"
            ? pathname === "/"
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
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
    </nav>
  );
}
