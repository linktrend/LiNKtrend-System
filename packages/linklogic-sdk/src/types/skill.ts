export interface SkillEngineRequirements {
  min_reasoning_tier: string;
  preferred_model: string;
  context_required: number;
}

export interface SkillToolingPolicy {
  policy: string;
  jit_enabled_if: string;
  jit_tool_threshold: number;
  require_get_tool_details?: boolean;
}

export interface SkillPersistence {
  required: boolean;
  state_path: string;
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  usage_trigger?: string;
  version: string;
  release_tag?: string;
  created?: string;
  author?: string;
  tags?: string[];
  engine: SkillEngineRequirements;
  tooling: SkillToolingPolicy;
  tools?: string[];
  dependencies?: string[];
  permissions: string[];
  scope_out?: string[];
  persistence?: SkillPersistence;
  last_updated?: string;
}

export interface SkillManifest {
  frontmatter: SkillFrontmatter;
  body: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  manifest: SkillManifest | null;
  errors: ValidationIssue[];
}

export interface SkillCatalogEntry {
  id: string;
  skill_name: string;
  skill_version: string;
  capability_id: string;
  public_contract: {
    description: string;
    input_schema_summary: string;
    output_schema_summary: string;
    execution_mode: "managed" | "hybrid" | "client_side_jit";
  };
  runtime_disclosure: {
    run_scoped_manifest: boolean;
    tenant_scoped: boolean;
    capability_scoped: boolean;
    ttl_seconds: number;
    token_payload_shape: {
      tenant_id: string;
      run_id: string;
      capability_id: string;
      skill_name: string;
      exp: number;
    };
  };
}

export interface ScaffoldOptions {
  taskIdPlaceholder?: string;
  version?: string;
  releaseTag?: string;
  preferredModel?: string;
  contextRequired?: number;
}

export interface ScaffoldedFile {
  path: string;
  content: string;
}

export interface ScaffoldResult {
  skillDir: string;
  files: ScaffoldedFile[];
}
