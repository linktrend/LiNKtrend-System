import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  adminLeadExecutorTemplate,
  resolveLicensorLeadAgentId,
} from "./admin-project-suite-binding";

describe("admin project suite binding", () => {
  it("adminLeadExecutorTemplate exposes roleId for suite_gen lead", () => {
    const lead = adminLeadExecutorTemplate("suite_gen");
    expect(lead.name).toBe("Suite Architect");
    expect(lead.roleId).toBe("linksuitegen_suite_architect");
  });

  it("resolveLicensorLeadAgentId prefers role_id match in licensor fleet", () => {
    const id = resolveLicensorLeadAgentId(
      [
        {
          id: "11111111-1111-4111-8111-111111111111",
          display_name: "Client Bot",
          runtime_settings: { linkaios_fleet: { scope: "licensee", tenant_id: "client-1" } },
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          display_name: "Other Architect",
          runtime_settings: {
            linkaios_fleet: { scope: "licensor", role_id: "linksuitegen_suite_architect" },
          },
        },
      ],
      { name: "Suite Architect", roleId: "linksuitegen_suite_architect" },
      "lic-tenant",
    );
    expect(id).toBe("22222222-2222-4222-8222-222222222222");
  });

  it("resolveLicensorLeadAgentId falls back to exact display_name in licensor fleet", () => {
    const id = resolveLicensorLeadAgentId(
      [
        {
          id: "33333333-3333-4333-8333-333333333333",
          display_name: "Librarian Bot",
          tenant_id: "lic-tenant",
          runtime_settings: {},
        },
      ],
      { name: "Librarian Bot" },
      "lic-tenant",
    );
    expect(id).toBe("33333333-3333-4333-8333-333333333333");
  });

  it("resolveLicensorLeadAgentId returns null when no licensor fleet match", () => {
    const id = resolveLicensorLeadAgentId(
      [{ id: "a1", display_name: "Suite Architect", runtime_settings: { linkaios_fleet: { scope: "licensee" } } }],
      { name: "Suite Architect", roleId: "linksuitegen_suite_architect" },
      "lic-tenant",
    );
    expect(id).toBeNull();
  });
});
