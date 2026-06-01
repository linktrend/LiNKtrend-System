import "server-only";

import { createProjectPersisted, persistenceEnabled } from "./create-project-persistence";
import { createProjectStub } from "./create-project";
import type { CreateProjectRequest, CreateProjectResponse } from "./types";

/** Create a project — Supabase when configured, otherwise in-memory stub. */
export async function createProject(input: CreateProjectRequest): Promise<CreateProjectResponse> {
  if (persistenceEnabled()) {
    return createProjectPersisted(input);
  }
  return createProjectStub(input);
}
