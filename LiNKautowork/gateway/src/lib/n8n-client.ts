import { randomUUID } from "node:crypto";
import { workflowHandleToN8nWebhookPath } from "./workflow-handle-path.js";

interface N8nWorkflowListResponse {
  data?: Array<{ id?: string | number; name?: string }>;
}

interface N8nWorkflowCreateResponse {
  id?: string | number;
}

interface N8nExecutionResponse {
  executionId?: string | number;
  id?: string | number;
  data?: unknown;
}

export interface N8nClient {
  importWorkflow(templateJson: object): Promise<{ workflowId: string }>;
  activateWorkflow(workflowId: string): Promise<void>;
  executeWorkflow(
    workflowId: string,
    payload: Record<string, unknown>,
  ): Promise<{ executionId: string; result?: unknown }>;
  checkHealth(): Promise<boolean>;
}

export class N8nHttpClient implements N8nClient {
  constructor(
    private readonly config: {
      baseUrl: string;
      apiKey?: string;
      timeoutMs?: number;
    },
  ) {}

  async importWorkflow(templateJson: object): Promise<{ workflowId: string }> {
    const payload = { ...templateJson, active: false };
    const created = await this.requestJson<N8nWorkflowCreateResponse>("/api/v1/workflows", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const workflowId = created.id !== undefined ? String(created.id) : randomUUID();
    return { workflowId };
  }

  async activateWorkflow(workflowId: string): Promise<void> {
    await this.requestJson(`/api/v1/workflows/${workflowId}/activate`, {
      method: "POST",
    });
  }

  async executeWorkflow(
    workflowId: string,
    payload: Record<string, unknown>,
  ): Promise<{ executionId: string; result?: unknown }> {
    const webhookPath = workflowHandleToN8nWebhookPath(workflowId);
    const response = await this.requestJson<N8nExecutionResponse>(
      `/webhook/${encodeURIComponent(webhookPath)}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    const executionId = response.executionId ?? response.id ?? randomUUID();
    return { executionId: String(executionId), result: response.data };
  }

  async checkHealth(): Promise<boolean> {
    try {
      const workflows = await this.requestJson<N8nWorkflowListResponse>("/api/v1/workflows", {
        method: "GET",
      });
      return Array.isArray(workflows.data) || workflows.data === undefined;
    } catch {
      return false;
    }
  }

  private async requestJson<T = unknown>(path: string, init: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 5000);
    try {
      const headers = new Headers(init.headers ?? {});
      headers.set("content-type", "application/json");
      if (this.config.apiKey) {
        headers.set("x-n8n-api-key", this.config.apiKey);
      }
      const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`n8n request failed (${response.status})`);
      }
      if (response.status === 204) {
        return {} as T;
      }
      return await response.json() as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

