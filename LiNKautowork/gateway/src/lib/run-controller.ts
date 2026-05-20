interface QueueState {
  running: Set<string>;
  queued: Set<string>;
}

export interface QueueStatus {
  running: string[];
  queued: string[];
  paused: boolean;
}

export interface RunController {
  pauseTenant(tenantId: string): void;
  resumeTenant(tenantId: string): void;
  isTenantPaused(tenantId: string): boolean;
  cancelRun(runId: string): void;
  isRunCancelled(runId: string): boolean;
  onKillSwitchTripped(capability: string): void;
  getQueueStatus(tenantId: string): QueueStatus;
  enqueueRun(tenantId: string, runId: string): void;
  markRunStarted(tenantId: string, runId: string): void;
  markRunFinished(tenantId: string, runId: string): void;
}

class InMemoryRunController implements RunController {
  private readonly pausedTenants = new Set<string>();
  private readonly cancelledRuns = new Set<string>();
  private readonly queueByTenant = new Map<string, QueueState>();

  pauseTenant(tenantId: string): void {
    this.pausedTenants.add(tenantId);
  }

  resumeTenant(tenantId: string): void {
    this.pausedTenants.delete(tenantId);
  }

  isTenantPaused(tenantId: string): boolean {
    return this.pausedTenants.has(tenantId);
  }

  cancelRun(runId: string): void {
    this.cancelledRuns.add(runId);
  }

  isRunCancelled(runId: string): boolean {
    return this.cancelledRuns.has(runId);
  }

  onKillSwitchTripped(_capability: string): void {
    for (const tenantId of this.queueByTenant.keys()) {
      this.pauseTenant(tenantId);
    }
  }

  getQueueStatus(tenantId: string): QueueStatus {
    const state = this.getOrCreateQueueState(tenantId);
    return {
      running: Array.from(state.running),
      queued: Array.from(state.queued),
      paused: this.isTenantPaused(tenantId),
    };
  }

  enqueueRun(tenantId: string, runId: string): void {
    this.getOrCreateQueueState(tenantId).queued.add(runId);
  }

  markRunStarted(tenantId: string, runId: string): void {
    const state = this.getOrCreateQueueState(tenantId);
    state.queued.delete(runId);
    state.running.add(runId);
  }

  markRunFinished(tenantId: string, runId: string): void {
    const state = this.getOrCreateQueueState(tenantId);
    state.queued.delete(runId);
    state.running.delete(runId);
    this.cancelledRuns.delete(runId);
  }

  clear(): void {
    this.pausedTenants.clear();
    this.cancelledRuns.clear();
    this.queueByTenant.clear();
  }

  private getOrCreateQueueState(tenantId: string): QueueState {
    const existing = this.queueByTenant.get(tenantId);
    if (existing) {
      return existing;
    }
    const created: QueueState = {
      running: new Set<string>(),
      queued: new Set<string>(),
    };
    this.queueByTenant.set(tenantId, created);
    return created;
  }
}

const runController = new InMemoryRunController();

export function getRunController(): RunController {
  return runController;
}

export function getMutableRunControllerForTesting(): InMemoryRunController {
  return runController;
}
