/** Sample trace rows for LiNKbrain Audit tab when the trace table is empty and UI mocks are enabled. */
export const DEMO_TRACE_ROWS: { event_type: string; mission_id: string | null; created_at: string }[] = [
  {
    event_type: "capability.lease.granted",
    mission_id: "00000000-0000-4000-8000-00000000d101",
    created_at: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    event_type: "capability.lease.executed",
    mission_id: "00000000-0000-4000-8000-00000000d101",
    created_at: new Date(Date.now() - 2_400_000).toISOString(),
  },
  {
    event_type: "brain.draft.approved",
    mission_id: null,
    created_at: new Date(Date.now() - 1_800_000).toISOString(),
  },
  {
    event_type: "tool.invoke.completed",
    mission_id: "00000000-0000-4000-8000-00000000d101",
    created_at: new Date(Date.now() - 900_000).toISOString(),
  },
  {
    event_type: "capability.lease.denied",
    mission_id: "00000000-0000-4000-8000-00000000d102",
    created_at: new Date(Date.now() - 300_000).toISOString(),
  },
];
