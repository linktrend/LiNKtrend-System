import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  GeneratedSuiteCandidate,
  HumanReviewRecord,
  MachineReviewRecord,
} from "./types";

export type LinksuitegenStoreSnapshot = {
  candidates: GeneratedSuiteCandidate[];
  machine_reviews: MachineReviewRecord[];
  human_reviews: HumanReviewRecord[];
  marketplace_plugins: Array<{
    suite_id: string;
    suite_version: string;
    display_name: string;
    stripe_product_id: string | null;
    published_at: string;
    candidate_id: string;
  }>;
};

const EMPTY: LinksuitegenStoreSnapshot = {
  candidates: [],
  machine_reviews: [],
  human_reviews: [],
  marketplace_plugins: [],
};

let memoryStore: LinksuitegenStoreSnapshot = { ...EMPTY, candidates: [], machine_reviews: [], human_reviews: [], marketplace_plugins: [] };

function storePath(): string {
  const root = process.env.LINKSUITEGEN_ADMIN_STORE_ROOT?.trim();
  if (root) return path.join(root, "linksuitegen-admin-store.json");
  return path.join(process.cwd(), ".data", "linksuitegen-admin-store.json");
}

export function resetLinksuitegenStoreForTests(snapshot?: LinksuitegenStoreSnapshot): void {
  memoryStore = snapshot ?? {
    candidates: [],
    machine_reviews: [],
    human_reviews: [],
    marketplace_plugins: [],
  };
}

async function persist(snapshot: LinksuitegenStoreSnapshot): Promise<void> {
  memoryStore = snapshot;
  if (process.env.LINKSUITEGEN_ADMIN_STORE_MODE === "memory") return;
  const file = storePath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(snapshot, null, 2), "utf8");
}

export async function loadLinksuitegenStore(): Promise<LinksuitegenStoreSnapshot> {
  if (process.env.LINKSUITEGEN_ADMIN_STORE_MODE === "memory") {
    return memoryStore;
  }
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as LinksuitegenStoreSnapshot;
    memoryStore = parsed;
    return parsed;
  } catch {
    return memoryStore;
  }
}

export async function saveLinksuitegenStore(snapshot: LinksuitegenStoreSnapshot): Promise<void> {
  await persist(snapshot);
}

export async function listCandidates(): Promise<GeneratedSuiteCandidate[]> {
  const store = await loadLinksuitegenStore();
  return [...store.candidates].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getCandidate(candidateId: string): Promise<GeneratedSuiteCandidate | null> {
  const store = await loadLinksuitegenStore();
  return store.candidates.find((c) => c.candidate_id === candidateId) ?? null;
}

export async function upsertCandidate(candidate: GeneratedSuiteCandidate): Promise<void> {
  const store = await loadLinksuitegenStore();
  const idx = store.candidates.findIndex((c) => c.candidate_id === candidate.candidate_id);
  if (idx >= 0) store.candidates[idx] = candidate;
  else store.candidates.push(candidate);
  await saveLinksuitegenStore(store);
}

export async function addMachineReview(record: MachineReviewRecord): Promise<void> {
  const store = await loadLinksuitegenStore();
  store.machine_reviews.push(record);
  await saveLinksuitegenStore(store);
}

export async function addHumanReview(record: HumanReviewRecord): Promise<void> {
  const store = await loadLinksuitegenStore();
  store.human_reviews.push(record);
  await saveLinksuitegenStore(store);
}

export async function publishMarketplacePlugin(entry: LinksuitegenStoreSnapshot["marketplace_plugins"][number]): Promise<void> {
  const store = await loadLinksuitegenStore();
  store.marketplace_plugins = store.marketplace_plugins.filter((p) => p.suite_id !== entry.suite_id);
  store.marketplace_plugins.push(entry);
  await saveLinksuitegenStore(store);
}

export async function listMarketplacePlugins(): Promise<LinksuitegenStoreSnapshot["marketplace_plugins"]> {
  const store = await loadLinksuitegenStore();
  return [...store.marketplace_plugins];
}
