import { ShellNav } from "@/components/shell-nav";

export function ShellLayout(props: {
  children: React.ReactNode;
  showDevtools?: boolean;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <ShellNav showDevtools={props.showDevtools} />
      <div className="mx-auto max-w-6xl px-6 py-8">{props.children}</div>
    </div>
  );
}
