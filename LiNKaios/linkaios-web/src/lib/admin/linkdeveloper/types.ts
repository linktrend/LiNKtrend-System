export type ProductRunSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  source_type: string;
  target_repo_path: string | null;
  target_repo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkGraphNode = {
  id: string;
  kind: "module" | "phase" | "issue";
  key: string;
  title: string;
  status: string;
  issue_id?: string;
};

export type WorkGraphResponse = {
  product_run_id: string;
  nodes: WorkGraphNode[];
  edges: Array<{ from: string; to: string; dependency_type?: string }>;
};

export type ArtifactSummary = {
  id: string;
  product_run_id: string;
  issue_id: string | null;
  artifact_type: string;
  title: string;
  version: number;
  content_uri: string | null;
  created_at: string;
};

export type ReleaseReadinessResponse = {
  product_run_id: string;
  ready: boolean;
  blockers: string[];
  checklist: Array<{ id: string; label: string; complete: boolean }>;
};

export interface LinkdeveloperAdminClient {
  listProductRuns(): Promise<ProductRunSummary[]>;
  getProductRun(id: string): Promise<ProductRunSummary>;
  getWorkGraph(id: string): Promise<WorkGraphResponse>;
  listArtifacts(id: string): Promise<ArtifactSummary[]>;
  getReleaseReadiness(id: string): Promise<ReleaseReadinessResponse>;
}
