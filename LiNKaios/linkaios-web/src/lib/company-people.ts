import type { CorporateProfileFixture } from "@/lib/company-fixtures";
import { generateProfileEntryId } from "@/lib/operator-profile";

export type CompanyPersonContact = {
  id: string;
  nameTitle: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CompanyDirector = CompanyPersonContact & {
  directorTitle: string;
};

export type CompanyOfficerRole = "secretary" | "ceo" | "cfo" | "coo" | "other";

export type CompanyOfficer = CompanyPersonContact & {
  role: CompanyOfficerRole;
  roleLabel: string;
};

export type CompanyShareholder = CompanyPersonContact & {
  ownershipPercent: number;
};

export type CompanyPeopleState = {
  directors: CompanyDirector[];
  officers: CompanyOfficer[];
  shareholders: CompanyShareholder[];
};

export const COMPANY_PEOPLE_COUNT_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
export const COMPANY_OFFICER_COUNT_OPTIONS = [0, 1, 2, 3, 4, 5] as const;

export { PHONE_COUNTRY_CODE_OPTIONS } from "@/lib/form-geo-data";

export const OFFICER_ROLE_OPTIONS: { value: CompanyOfficerRole; label: string }[] = [
  { value: "secretary", label: "Company secretary" },
  { value: "ceo", label: "CEO" },
  { value: "cfo", label: "CFO" },
  { value: "coo", label: "COO" },
  { value: "other", label: "Other" },
];

export const OWNERSHIP_PERCENT_OPTIONS = Array.from({ length: 21 }, (_, index) => index * 5);

export const EVENT_COMPANY_PEOPLE_CHANGED = "linkaios-company-people-changed";

const STORAGE_PREFIX = "linkaios-company-people-v1";

function storageKey(companyId: string): string {
  return `${STORAGE_PREFIX}:${companyId}`;
}

export function emptyCompanyPerson(): CompanyPersonContact {
  return {
    id: generateProfileEntryId(),
    nameTitle: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
    streetAddress1: "",
    streetAddress2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  };
}

export function emptyDirector(): CompanyDirector {
  return { ...emptyCompanyPerson(), directorTitle: "Director" };
}

export function emptyOfficer(role: CompanyOfficerRole = "secretary"): CompanyOfficer {
  return { ...emptyCompanyPerson(), role, roleLabel: "" };
}

export function emptyShareholder(ownershipPercent = 0): CompanyShareholder {
  return { ...emptyCompanyPerson(), ownershipPercent };
}

function splitName(full: string): Pick<CompanyPersonContact, "firstName" | "middleName" | "lastName"> {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, middleName: "", lastName: "" };
  if (parts.length === 2) return { firstName: parts[0]!, middleName: "", lastName: parts[1]! };
  return { firstName: parts[0]!, middleName: parts.slice(1, -1).join(" "), lastName: parts[parts.length - 1]! };
}

function parseDirectorLine(line: string): Pick<CompanyDirector, "firstName" | "middleName" | "lastName" | "directorTitle"> {
  const match = line.match(/^(.+?)\s*\((.+)\)\s*$/);
  const names = match ? splitName(match[1]!.trim()) : splitName(line);
  return { ...names, directorTitle: "Director" };
}

function parseShareholderLines(text: string): CompanyShareholder[] {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const parsed = lines.map((line) => {
    const [namePart, detailPart = ""] = line.split("—").map((part) => part.trim());
    const shareMatch = detailPart.match(/([\d,]+)/);
    const shareCount = shareMatch ? Number(shareMatch[1]!.replace(/,/g, "")) : 0;
    return { ...splitName(namePart ?? line), shareCount };
  });

  const totalShares = parsed.reduce((sum, row) => sum + row.shareCount, 0);
  return parsed.map((row) => ({
    ...emptyShareholder(),
    firstName: row.firstName,
    middleName: row.middleName,
    lastName: row.lastName,
    ownershipPercent:
      totalShares > 0 && row.shareCount > 0
        ? Math.round((row.shareCount / totalShares) * 100)
        : lines.length === 1
          ? 100
          : 0,
  }));
}

function entityAsOfficer(name: string, role: CompanyOfficerRole): CompanyOfficer {
  const trimmed = name.trim();
  if (!trimmed) return emptyOfficer(role);
  return {
    ...emptyOfficer(role),
    firstName: trimmed,
    middleName: "",
    lastName: "",
    roleLabel: "",
  };
}

export function companyPeopleFromCorporateFixture(profile: CorporateProfileFixture): CompanyPeopleState {
  const directors = profile.directors
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ ...emptyDirector(), ...parseDirectorLine(line) }));

  const officers: CompanyOfficer[] = [];
  if (profile.secretary.trim()) {
    officers.push(entityAsOfficer(profile.secretary, "secretary"));
  }

  const shareholders = parseShareholderLines(profile.shareholders);
  normalizeShareholderPercentages(shareholders);

  return { directors, officers, shareholders };
}

export function normalizeShareholderPercentages(shareholders: CompanyShareholder[]): void {
  if (shareholders.length === 0) return;
  const total = shareholders.reduce((sum, row) => sum + row.ownershipPercent, 0);
  if (total === 100) return;
  if (shareholders.length === 1) {
    shareholders[0]!.ownershipPercent = 100;
    return;
  }
  const even = Math.floor(100 / shareholders.length);
  let remainder = 100 - even * shareholders.length;
  for (const row of shareholders) {
    row.ownershipPercent = even + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }
}

function normalizePerson<T extends CompanyPersonContact>(person: T): T {
  return {
    ...emptyCompanyPerson(),
    ...person,
    nameTitle: person.nameTitle ?? "",
  };
}

export function readCompanyPeople(companyId: string, seed: CorporateProfileFixture): CompanyPeopleState {
  if (typeof window === "undefined") return companyPeopleFromCorporateFixture(seed);
  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return companyPeopleFromCorporateFixture(seed);
    const parsed = JSON.parse(raw) as CompanyPeopleState;
    return {
      directors: Array.isArray(parsed.directors) ? parsed.directors.map((row) => normalizePerson({ ...emptyDirector(), ...row, directorTitle: "Director" })) : [],
      officers: Array.isArray(parsed.officers) ? parsed.officers.map((row) => normalizePerson({ ...emptyOfficer("secretary"), ...row })) : [],
      shareholders: Array.isArray(parsed.shareholders) ? parsed.shareholders.map((row) => normalizePerson({ ...emptyShareholder(0), ...row })) : [],
    };
  } catch {
    return companyPeopleFromCorporateFixture(seed);
  }
}

export function writeCompanyPeople(companyId: string, state: CompanyPeopleState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(companyId), JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT_COMPANY_PEOPLE_CHANGED, { detail: { companyId } }));
}

export function companyPersonDisplayName(person: Pick<CompanyPersonContact, "firstName" | "middleName" | "lastName">): string {
  return [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ") || "—";
}

export function companyPersonAddressLine(person: CompanyPersonContact): string {
  const line1 = [person.streetAddress1, person.streetAddress2].filter(Boolean).join(", ");
  const line2 = [person.city, person.state, person.postalCode].filter(Boolean).join(", ");
  const parts = [line1, line2, person.country].filter(Boolean);
  return parts.join(" · ") || "—";
}

export function companyPersonPhoneLine(person: CompanyPersonContact): string {
  const phone = `${person.phoneCountryCode} ${person.phoneNumber}`.trim();
  return phone || "—";
}

export function officerRoleLabel(officer: CompanyOfficer): string {
  if (officer.role === "other") return officer.roleLabel.trim() || "Other officer";
  return OFFICER_ROLE_OPTIONS.find((option) => option.value === officer.role)?.label ?? officer.role;
}

export function shareholderOwnershipTotal(shareholders: CompanyShareholder[]): number {
  return shareholders.reduce((sum, row) => sum + row.ownershipPercent, 0);
}

export function resizePeopleList<T>(current: T[], nextCount: number, createEmpty: () => T): T[] {
  if (nextCount <= current.length) return current.slice(0, nextCount);
  return [...current, ...Array.from({ length: nextCount - current.length }, createEmpty)];
}
