export interface N8nWebhookPayload {
  executionId: string;
  status: "success" | "failed";
  result?: unknown;
  error?: string;
}

type N8nWebhookCallback = (payload: N8nWebhookPayload) => Promise<void>;

export class N8nWebhookRegistry {
  private readonly callbacks = new Map<string, N8nWebhookCallback>();

  registerWebhookHandler(path: string, handler: N8nWebhookCallback): void {
    this.callbacks.set(path, handler);
  }

  async handleWebhook(path: string, payload: N8nWebhookPayload): Promise<boolean> {
    const handler = this.callbacks.get(path);
    if (!handler) {
      return false;
    }
    await handler(payload);
    return true;
  }
}

