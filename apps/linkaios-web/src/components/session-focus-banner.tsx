export function SessionFocusBanner(props: { sessionId: string }) {
  return (
    <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
      <p className="font-medium">Opened from Sessions inbox</p>
      <p className="mt-1 font-mono text-xs text-sky-900">{props.sessionId}</p>
      <p className="mt-2 text-xs text-sky-800">
        Gateway-backed transcript and tools for this session will surface here when wired.
      </p>
    </div>
  );
}
