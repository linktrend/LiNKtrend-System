import { LinkdeveloperNotFoundError } from "./errors";
import type {
  ArtifactSummary,
  LinkdeveloperAdminClient,
  ProductRunSummary,
  ReleaseReadinessResponse,
  WorkGraphResponse,
} from "./types";

const DEMO_RUN: ProductRunSummary = {
  id: "00000000-0000-0000-0000-00000000linkdev",
  name: "LinkApps pilot",
  slug: "linkapps-pilot",
  status: "intake",
  source_type: "raw_idea",
  target_repo_path: null,
  target_repo_url: "https://github.com/linktrend/example-app",
  created_at: "2026-06-06T12:00:00.000Z",
  updated_at: "2026-06-06T12:00:00.000Z",
};

export class InMemoryLinkdeveloperAdminClient implements LinkdeveloperAdminClient {
  async listProductRuns(): Promise<ProductRunSummary[]> {
    return [DEMO_RUN];
  }

  async getProductRun(id: string): Promise<ProductRunSummary> {
    if (id !== DEMO_RUN.id) {
      throw new LinkdeveloperNotFoundError();
    }
    return DEMO_RUN;
  }

  async getWorkGraph(id: string): Promise<WorkGraphResponse> {
    await this.getProductRun(id);
    return {
      product_run_id: id,
      nodes: [
        { id: "m1", kind: "module", key: "module_intake", title: "Intake", status: "active" },
        { id: "i1", kind: "issue", key: "capture_raw_product_idea", title: "Capture idea", status: "ready", issue_id: "i1" },
      ],
      edges: [],
    };
  }

  async listArtifacts(id: string): Promise<ArtifactSummary[]> {
    await this.getProductRun(id);
    return [];
  }

  async getReleaseReadiness(id: string): Promise<ReleaseReadinessResponse> {
    await this.getProductRun(id);
    return {
      product_run_id: id,
      ready: false,
      blockers: ["G1 product qualification pending"],
      checklist: [{ id: "g1", label: "G1 council + human approval", complete: false }],
    };
  }
}

let singleton: InMemoryLinkdeveloperAdminClient | null = null;

export function getInMemoryLinkdeveloperClient(): LinkdeveloperAdminClient {
  singleton ??= new InMemoryLinkdeveloperAdminClient();
  return singleton;
}
