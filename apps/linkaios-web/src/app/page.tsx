import { BrandHeading } from "@linktrend/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 p-10">
      <BrandHeading>LiNKaios</BrandHeading>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">
        Command centre shell for the LiNKtrend monorepo. Shared packages are
        wired; dashboards and governed flows come next per the PRD build order.
      </p>
    </main>
  );
}
