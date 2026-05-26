export type CapabilitiesHubSliceStats = {
  total: number;
  approved: number;
  draft: number;
  sunset: number;
  sunsetLabel: string;
  publishedOn: number;
  runtimeOn: number;
  fixtures: number;
};

export type ConnectorsHubStats = {
  total: number;
  implemented: number;
  declared: number;
  pending: number;
};

export type LeasesHubStats = {
  total: number;
  approved: number;
  draft: number;
  denied: number;
  available: number;
};

export type HubCardStatLine = {
  label: string;
  value: number;
};

export type CapabilitiesSliceStatRow = {
  status: string;
  published: boolean;
  runtimeEnabled: boolean;
  isFixture?: boolean;
};

export function computeCapabilitiesSliceStats(
  rows: CapabilitiesSliceStatRow[],
  sunsetStatuses: Set<string>,
  sunsetLabel: string,
): CapabilitiesHubSliceStats {
  return {
    total: rows.length,
    approved: rows.filter((r) => r.status === "approved").length,
    draft: rows.filter((r) => r.status === "draft").length,
    sunset: rows.filter((r) => sunsetStatuses.has(r.status)).length,
    sunsetLabel,
    publishedOn: rows.filter((r) => r.published).length,
    runtimeOn: rows.filter((r) => r.runtimeEnabled).length,
    fixtures: rows.filter((r) => r.isFixture).length,
  };
}

/** Five-line hub card stats for skills and tools catalogues. */
export function hubCatalogStatLines(stats: CapabilitiesHubSliceStats): HubCardStatLine[] {
  return [
    { label: "Total", value: stats.total },
    { label: "Approved", value: stats.approved },
    { label: "Draft", value: stats.draft },
    { label: stats.sunsetLabel, value: stats.sunset },
    { label: "Available", value: stats.publishedOn },
  ];
}

/** Five-line hub card stats for capability connectors. */
export function hubConnectorStatLines(stats: ConnectorsHubStats): HubCardStatLine[] {
  return [
    { label: "Total", value: stats.total },
    { label: "Approved", value: stats.implemented },
    { label: "Draft", value: stats.declared },
    { label: "Pending", value: stats.pending },
    { label: "Available", value: stats.total - stats.pending },
  ];
}

export function computeLeasesHubStats(leases: { status: string }[]): LeasesHubStats {
  return {
    total: leases.length,
    approved: leases.filter((l) => l.status === "granted" || l.status === "executed").length,
    draft: leases.filter((l) => l.status === "requires_approval").length,
    denied: leases.filter((l) => l.status === "denied").length,
    available: leases.filter((l) => l.status === "granted").length,
  };
}

/** Five-line hub card stats for leases (24h window). */
export function hubLeaseStatLines(stats: LeasesHubStats): HubCardStatLine[] {
  return [
    { label: "Total", value: stats.total },
    { label: "Approved", value: stats.approved },
    { label: "Draft", value: stats.draft },
    { label: "Denied", value: stats.denied },
    { label: "Available", value: stats.available },
  ];
}
