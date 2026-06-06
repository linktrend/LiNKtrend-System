import { getLinkdeveloperAdminClient } from "./client";

export async function loadLinkdeveloperProductRuns() {
  return getLinkdeveloperAdminClient().listProductRuns();
}

export async function loadLinkdeveloperProductRun(id: string) {
  return getLinkdeveloperAdminClient().getProductRun(id);
}

export async function loadLinkdeveloperWorkGraph(id: string) {
  return getLinkdeveloperAdminClient().getWorkGraph(id);
}

export async function loadLinkdeveloperArtifacts(id: string) {
  return getLinkdeveloperAdminClient().listArtifacts(id);
}

export async function loadLinkdeveloperReleaseReadiness(id: string) {
  return getLinkdeveloperAdminClient().getReleaseReadiness(id);
}
