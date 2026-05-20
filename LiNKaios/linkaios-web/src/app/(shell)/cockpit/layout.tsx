import Link from "next/link";
import { Activity, ChevronRight, Gauge, Layers, Shield } from "lucide-react";

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: "/cockpit", label: "Dashboard", icon: Gauge },
    { href: "/cockpit/modules", label: "Modules", icon: Layers },
    { href: "/cockpit/leases", label: "Leases", icon: Shield },
    { href: "/cockpit/runs", label: "Runs", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Cockpit sub-navigation */}
      <nav className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
        {navItems.map((item, index) => (
          <div key={item.href} className="flex items-center">
            <Link
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
            {index < navItems.length - 1 && (
              <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
            )}
          </div>
        ))}
      </nav>

      {children}
    </div>
  );
}
