import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("../../../../../../LiNKbrain/librarian/knowledge-loop", () => ({
  attachWorldBrainContribution: vi.fn(),
  anonymizeKnowledgeForWorldBrain: vi.fn(),
  buildCompanyKnowledgeRecord: vi.fn(),
  getKnowledgeProposal: vi.fn(),
  reviewKnowledgeProposal: vi.fn(),
}));
vi.mock("../../../../../../LiNKguard/sidecar/linkguard/src/world-brain-confidentiality", () => ({
  evaluateWorldBrainContribution: vi.fn(),
}));
vi.mock("@/lib/command-centre-access", () => ({
  canWriteCommandCentre: vi.fn(() => true),
  getCommandCentreRoleForUser: vi.fn(async () => "admin"),
}));

import { reviewLibrarianKnowledgeProposalAction } from "./librarian-actions";

describe("librarian review actions (LTS-021)", () => {
  it("exports review action for Principal accept/reject/edit path", () => {
    expect(typeof reviewLibrarianKnowledgeProposalAction).toBe("function");
  });
});
