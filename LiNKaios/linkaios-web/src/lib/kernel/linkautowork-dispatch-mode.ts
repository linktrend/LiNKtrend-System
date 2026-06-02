/** Whether kernel should call live LiNKautowork handlers (vs wf-* mock). */
export function shouldUseLiveAutoworkDispatch(): boolean {
  const mode = process.env.LINKAUTOWORK_DISPATCH_MODE?.trim().toLowerCase();
  if (mode === "mock") return false;
  if (mode === "live" || mode === "direct") return true;
  if (process.env.NODE_ENV === "test") return false;
  return true;
}
