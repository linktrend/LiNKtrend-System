export interface QueueStatus {
  running: string[];
  queued: string[];
  paused: boolean;
}

export interface AutoworkControlsPanelProps {
  tenantId: string;
  queue: QueueStatus;
  onPauseAll: () => void;
  onResumeAll: () => void;
  onCancelRun: (runId: string) => void;
}

export function AutoworkControlsPanel(props: AutoworkControlsPanelProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">LiNKautowork Controls</h2>
      <p className="mt-2 text-xs text-zinc-600">Tenant: {props.tenantId}</p>
      <p className="mt-1 text-xs text-zinc-600">
        Status: {props.queue.paused ? "Paused" : "Running"}
      </p>

      <div className="mt-3">
        <h3 className="text-xs font-medium text-zinc-800">Active Runs</h3>
        {props.queue.running.length === 0 ? (
          <p className="mt-1 text-xs text-zinc-500">No active runs.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {props.queue.running.map((runId) => (
              <li key={runId} className="flex items-center justify-between text-xs text-zinc-700">
                <span>{runId}</span>
                <button
                  type="button"
                  onClick={() => props.onCancelRun(runId)}
                  className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-xs text-zinc-600">Queue: {props.queue.queued.length} runs waiting</p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={props.onPauseAll}
          className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
        >
          Pause All
        </button>
        <button
          type="button"
          onClick={props.onResumeAll}
          className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100"
        >
          Resume All
        </button>
      </div>
    </section>
  );
}
