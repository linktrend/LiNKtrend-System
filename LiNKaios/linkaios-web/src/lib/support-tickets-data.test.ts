import { describe, expect, it } from "vitest";

import {
  isMissingSupportTicketsTableError,
  mapSupportTicketRow,
  mergeSupportTicketSources,
  supportTicketIdForWorkAlert,
} from "./support-tickets-data";

describe("isMissingSupportTicketsTableError", () => {
  it("detects PostgREST missing table codes", () => {
    expect(isMissingSupportTicketsTableError("relation does not exist", "42P01")).toBe(true);
    expect(isMissingSupportTicketsTableError("Could not find the table linkaios.support_tickets", "PGRST205")).toBe(
      true,
    );
    expect(isMissingSupportTicketsTableError("permission denied")).toBe(false);
  });
});

describe("mapSupportTicketRow", () => {
  it("maps snake_case database rows to SupportTicket", () => {
    const ticket = mapSupportTicketRow({
      id: "11111111-1111-4111-8111-111111111111",
      licensee_id: "xyz-marketing",
      company_id: "co-1",
      brand_id: null,
      subject: "Billing question",
      description: "Need help with invoice",
      page_path: "/settings/billing",
      status: "open",
      priority: "normal",
      source: "page_help",
      requested_by: "Licensee admin",
      created_at: "2026-06-10T12:00:00.000Z",
      updated_at: "2026-06-10T12:00:00.000Z",
      external_ref: null,
      ai_attempt_summary: "Tried self-serve steps",
    });

    expect(ticket.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(ticket.licenseeId).toBe("xyz-marketing");
    expect(ticket.pagePath).toBe("/settings/billing");
    expect(ticket.aiAttemptSummary).toBe("Tried self-serve steps");
  });
});

describe("mergeSupportTicketSources", () => {
  it("prefers database tickets over local duplicates", () => {
    const merged = mergeSupportTicketSources(
      [
        {
          id: "shared-id",
          licenseeId: "xyz-marketing",
          companyId: null,
          brandId: null,
          subject: "DB version",
          description: "from db",
          pagePath: "/",
          status: "in_progress",
          priority: "normal",
          source: "manual",
          requestedBy: "ops",
          createdAt: "2026-06-10T11:00:00.000Z",
          updatedAt: "2026-06-10T11:00:00.000Z",
          externalRef: null,
          aiAttemptSummary: null,
        },
      ],
      [
        {
          id: "shared-id",
          licenseeId: "xyz-marketing",
          companyId: null,
          brandId: null,
          subject: "Local version",
          description: "from browser",
          pagePath: "/",
          status: "open",
          priority: "normal",
          source: "manual",
          requestedBy: "user",
          createdAt: "2026-06-10T12:00:00.000Z",
          updatedAt: "2026-06-10T12:00:00.000Z",
          externalRef: null,
          aiAttemptSummary: null,
        },
      ],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]?.subject).toBe("DB version");
    expect(merged[0]?.status).toBe("in_progress");
  });
});

describe("supportTicketIdForWorkAlert", () => {
  it("prefixes uuid ticket ids for work alert routing", () => {
    expect(supportTicketIdForWorkAlert("11111111-1111-4111-8111-111111111111")).toBe(
      "support-11111111-1111-4111-8111-111111111111",
    );
    expect(supportTicketIdForWorkAlert("st-local")).toBe("support-st-local");
  });
});
