type Props = {
  productRunId: string;
  status: string;
};

export function ProductRunLifecycleActions(props: Props) {
  return (
    <span className="text-sm text-zinc-500 dark:text-zinc-400">
      Run {props.productRunId.slice(0, 8)} · {props.status}
    </span>
  );
}
