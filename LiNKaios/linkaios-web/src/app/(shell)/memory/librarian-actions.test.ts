import { describe, expect, it } from "vitest";

import { reviewLibrarianKnowledgeProposalAction } from "./librarian-actions";

describe("librarian review actions (LTS-021)", () => {
  it("exports review action for Principal accept/reject/edit path", () => {
    expect(typeof reviewLibrarianKnowledgeProposalAction).toBe("function");
  });
});
