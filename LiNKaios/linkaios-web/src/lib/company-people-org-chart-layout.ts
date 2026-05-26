import type { OrgDepartmentFixture } from "@/lib/company-fixtures";
import {
  companyPersonDisplayName,
  officerRoleLabel,
  type CompanyDirector,
  type CompanyOfficer,
  type CompanyPeopleState,
} from "@/lib/company-people";

export type CompanyPeopleOrgNodeKind = "company" | "executive" | "director" | "officer" | "department";

export type CompanyPeopleOrgNode = {
  id: string;
  kind: CompanyPeopleOrgNodeKind;
  title: string;
  subtitle: string;
  x: number;
  y: number;
};

export type CompanyPeopleOrgEdge = { from: string; to: string };

const CHART_W = 1000;
const ROW_Y = [72, 228, 404] as const;
const NODE_SPREAD = 168;

function rowPositions(count: number, y: number): Pick<CompanyPeopleOrgNode, "x" | "y">[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: CHART_W / 2, y }];
  const span = Math.min(CHART_W - 120, NODE_SPREAD * (count - 1));
  const start = (CHART_W - span) / 2;
  const step = count > 1 ? span / (count - 1) : 0;
  return Array.from({ length: count }, (_, index) => ({
    x: start + step * index,
    y,
  }));
}

function namedDirectors(directors: CompanyDirector[]): CompanyDirector[] {
  return directors.filter((director) => companyPersonDisplayName(director) !== "—");
}

function namedOfficers(officers: CompanyOfficer[]): CompanyOfficer[] {
  return officers.filter((officer) => companyPersonDisplayName(officer) !== "—");
}

function departmentNodes(departments: OrgDepartmentFixture[]): { id: string; title: string; subtitle: string }[] {
  return departments
    .filter((dept) => dept.lead.trim() || dept.department.trim())
    .map((dept) => ({
      id: `dept-${dept.id}`,
      title: dept.lead.trim() || "Vacant",
      subtitle: dept.department.trim() || dept.location.trim() || "Department",
    }));
}

export function buildCompanyPeopleOrgChart(input: {
  companyName: string;
  people: CompanyPeopleState;
  departments: OrgDepartmentFixture[];
}): { nodes: CompanyPeopleOrgNode[]; edges: CompanyPeopleOrgEdge[]; width: number; height: number } {
  const directors = namedDirectors(input.people.directors);
  const officers = namedOfficers(input.people.officers);
  const ceo = officers.find((officer) => officer.role === "ceo");
  const otherOfficers = officers.filter((officer) => officer.role !== "ceo");
  const depts = departmentNodes(input.departments);

  const nodes: CompanyPeopleOrgNode[] = [];
  const edges: CompanyPeopleOrgEdge[] = [];

  let apexId: string;

  if (ceo) {
    apexId = `officer-${ceo.id}`;
    nodes.push({
      id: apexId,
      kind: "executive",
      title: companyPersonDisplayName(ceo),
      subtitle: "Chief Executive Officer",
      ...rowPositions(1, ROW_Y[0])[0]!,
    });
  } else if (directors.length > 0) {
    const lead = directors[0]!;
    apexId = `director-${lead.id}`;
    nodes.push({
      id: apexId,
      kind: "executive",
      title: companyPersonDisplayName(lead),
      subtitle: directors.length > 1 ? "Managing Director" : "Director",
      ...rowPositions(1, ROW_Y[0])[0]!,
    });
  } else if (officers.length > 0) {
    const lead = officers[0]!;
    apexId = `officer-${lead.id}`;
    nodes.push({
      id: apexId,
      kind: "executive",
      title: companyPersonDisplayName(lead),
      subtitle: officerRoleLabel(lead),
      ...rowPositions(1, ROW_Y[0])[0]!,
    });
  } else {
    apexId = "company-root";
    nodes.push({
      id: apexId,
      kind: "company",
      title: input.companyName,
      subtitle: "Company",
      ...rowPositions(1, ROW_Y[0])[0]!,
    });
  }

  const leadershipRow: CompanyPeopleOrgNode[] = [];

  const directorNodes = (ceo ? directors : directors.slice(1)).map((director) => ({
    id: `director-${director.id}`,
    kind: "director" as const,
    title: companyPersonDisplayName(director),
    subtitle: "Director",
  }));

  const officerNodes = (ceo ? otherOfficers : officers.slice(apexId.startsWith("officer-") ? 1 : 0)).map((officer) => ({
    id: `officer-${officer.id}`,
    kind: "officer" as const,
    title: companyPersonDisplayName(officer),
    subtitle: officerRoleLabel(officer),
  }));

  for (const spec of [...directorNodes, ...officerNodes]) {
    if (spec.id === apexId) continue;
    leadershipRow.push({ ...spec, x: 0, y: ROW_Y[1] });
  }

  const leadershipPositions = rowPositions(leadershipRow.length, ROW_Y[1]);
  leadershipRow.forEach((node, index) => {
    const pos = leadershipPositions[index]!;
    nodes.push({ ...node, x: pos.x, y: pos.y });
    edges.push({ from: apexId, to: node.id });
  });

  const deptSpecs = depts.map((dept) => ({
    id: dept.id,
    kind: "department" as const,
    title: dept.title,
    subtitle: dept.subtitle,
  }));

  const deptPositions = rowPositions(deptSpecs.length, ROW_Y[2]);
  const deptParent =
    leadershipRow.find((node) => node.subtitle.toLowerCase().includes("chief operating"))?.id ??
    leadershipRow.find((node) => node.kind === "officer")?.id ??
    apexId;

  deptSpecs.forEach((dept, index) => {
    const pos = deptPositions[index]!;
    nodes.push({ ...dept, x: pos.x, y: pos.y });
    edges.push({ from: deptParent, to: dept.id });
  });

  const height = depts.length > 0 ? 520 : leadershipRow.length > 0 ? 340 : 180;

  return { nodes, edges, width: CHART_W, height };
}
