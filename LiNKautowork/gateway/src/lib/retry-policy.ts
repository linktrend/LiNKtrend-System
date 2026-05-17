import type { FailureReport } from "@linktrend/linklogic-sdk";

export interface RetryPolicy {
  maxAttempts: number;
  delaysMs: number[];
  shouldRetry(failure: FailureReport, attempt: number): boolean;
  getDelayMs(attempt: number): number;
}

const NON_RETRYABLE_CODES = new Set([
  "WORKFLOW_NOT_FOUND",
  "LEASE_DENIED",
  "LEASE_KILL_SWITCH",
  "LEASE_REQUEST_INVALID",
]);

export class ExponentialBackoffPolicy implements RetryPolicy {
  readonly maxAttempts: number;
  readonly delaysMs: number[];

  constructor(maxAttempts = 3, delaysMs = [1000, 4000, 16000]) {
    this.maxAttempts = maxAttempts;
    this.delaysMs = delaysMs;
  }

  shouldRetry(failure: FailureReport, attempt: number): boolean {
    if (attempt >= this.maxAttempts) {
      return false;
    }
    if (!failure.retryable) {
      return false;
    }
    if (NON_RETRYABLE_CODES.has(failure.code)) {
      return false;
    }
    return true;
  }

  getDelayMs(attempt: number): number {
    return this.delaysMs[attempt - 1] ?? 0;
  }
}

export async function sleepMs(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return;
  }
  if (process.env.NODE_ENV === "test") {
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
