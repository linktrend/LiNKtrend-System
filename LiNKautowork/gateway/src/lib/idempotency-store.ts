import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import type { WorkflowInvokeResult } from "@linktrend/linklogic-sdk";

type PersistedEntry = {
  keyHash: string;
  tenantId: string;
  workflowHandle: string;
  workflowRunId: string;
  status: "succeeded" | "failed";
  result: WorkflowInvokeResult;
  createdAt: string;
  expiresAt: string;
};

export interface IdempotencyStore {
  getCachedResult(keyHash: string): Promise<WorkflowInvokeResult | undefined>;
  cacheResult(
    keyHash: string,
    tenantId: string,
    workflowHandle: string,
    workflowRunId: string,
    result: WorkflowInvokeResult,
    ttlHours?: number,
  ): Promise<void>;
  cleanupExpired(before: Date): Promise<number>;
}

export function hashIdempotencyKey(idempotencyKey: string): string {
  return createHash("sha256").update(idempotencyKey).digest("hex");
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly entries = new Map<string, PersistedEntry>();

  async getCachedResult(keyHash: string): Promise<WorkflowInvokeResult | undefined> {
    const entry = this.entries.get(keyHash);
    if (!entry) return undefined;
    if (new Date(entry.expiresAt).getTime() <= Date.now()) {
      this.entries.delete(keyHash);
      return undefined;
    }
    return entry.result;
  }

  async cacheResult(
    keyHash: string,
    tenantId: string,
    workflowHandle: string,
    workflowRunId: string,
    result: WorkflowInvokeResult,
    ttlHours = 24,
  ): Promise<void> {
    const now = Date.now();
    const expires = now + ttlHours * 60 * 60 * 1000;
    this.entries.set(keyHash, {
      keyHash,
      tenantId,
      workflowHandle,
      workflowRunId,
      status: result.status,
      result,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(expires).toISOString(),
    });
  }

  async cleanupExpired(before: Date): Promise<number> {
    let removed = 0;
    for (const [key, entry] of this.entries.entries()) {
      if (new Date(entry.expiresAt).getTime() <= before.getTime()) {
        this.entries.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  clear(): void {
    this.entries.clear();
  }

  peekByKeyHash(keyHash: string): WorkflowInvokeResult | undefined {
    return this.entries.get(keyHash)?.result;
  }
}

export class FileIdempotencyStore implements IdempotencyStore {
  constructor(private readonly filePath = join(tmpdir(), "linkautowork-idempotency-store.json")) {
    this.ensureFile();
  }

  async getCachedResult(keyHash: string): Promise<WorkflowInvokeResult | undefined> {
    const db = this.readDb();
    const entry = db[keyHash];
    if (!entry) return undefined;
    if (new Date(entry.expiresAt).getTime() <= Date.now()) {
      delete db[keyHash];
      this.writeDb(db);
      return undefined;
    }
    return entry.result;
  }

  async cacheResult(
    keyHash: string,
    tenantId: string,
    workflowHandle: string,
    workflowRunId: string,
    result: WorkflowInvokeResult,
    ttlHours = 24,
  ): Promise<void> {
    const db = this.readDb();
    const now = Date.now();
    db[keyHash] = {
      keyHash,
      tenantId,
      workflowHandle,
      workflowRunId,
      status: result.status,
      result,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttlHours * 60 * 60 * 1000).toISOString(),
    };
    this.writeDb(db);
  }

  async cleanupExpired(before: Date): Promise<number> {
    const db = this.readDb();
    let removed = 0;
    for (const [keyHash, entry] of Object.entries(db)) {
      if (new Date(entry.expiresAt).getTime() <= before.getTime()) {
        delete db[keyHash];
        removed += 1;
      }
    }
    this.writeDb(db);
    return removed;
  }

  clear(): void {
    this.writeDb({});
  }

  private ensureFile(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, "{}", "utf8");
    }
  }

  private readDb(): Record<string, PersistedEntry> {
    this.ensureFile();
    const raw = readFileSync(this.filePath, "utf8");
    try {
      return JSON.parse(raw) as Record<string, PersistedEntry>;
    } catch {
      return {};
    }
  }

  private writeDb(db: Record<string, PersistedEntry>): void {
    this.ensureFile();
    writeFileSync(this.filePath, JSON.stringify(db), "utf8");
  }
}

export function createDefaultIdempotencyStore(): IdempotencyStore {
  if (process.env.AUTOWORK_IDEMPOTENCY_STORE === "memory" || process.env.NODE_ENV === "test") {
    return new InMemoryIdempotencyStore();
  }
  const filePath = process.env.AUTOWORK_IDEMPOTENCY_FILE_PATH;
  return new FileIdempotencyStore(filePath);
}

export function clearFileIdempotencyStore(filePath: string): void {
  rmSync(filePath, { force: true });
}
