export function BrandHeading(props: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
      {props.children}
    </h1>
  );
}
