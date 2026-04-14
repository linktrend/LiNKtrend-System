export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  service: string;
  [key: string]: unknown;
}

export function log(
  level: LogLevel,
  message: string,
  fields: LogFields,
): void {
  const line = JSON.stringify({ level, message, ts: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
