export type OperatorEducationEntry = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_year: number | null;
  end_year: number | null;
};

export type OperatorWorkEntry = {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
};

export type OperatorProfile = {
  username: string;
  display_name: string;
  personal_title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  personal_street_address_1: string;
  personal_street_address_2: string;
  personal_city: string;
  personal_state: string;
  personal_postal_code: string;
  personal_country: string;
  bio: string;
  business_position: string;
  business_company: string;
  business_street_address_1: string;
  business_street_address_2: string;
  business_city: string;
  business_state: string;
  business_postal_code: string;
  business_country: string;
  avatar_url: string | null;
  education: OperatorEducationEntry[];
  work_experience: OperatorWorkEntry[];
};

const STORAGE_KEY = "linkaios-operator-profile-v1";

export function generateProfileEntryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function emptyEducationEntry(): OperatorEducationEntry {
  return {
    id: generateProfileEntryId(),
    institution: "",
    degree: "",
    field: "",
    start_year: null,
    end_year: null,
  };
}

export function emptyWorkEntry(): OperatorWorkEntry {
  return {
    id: generateProfileEntryId(),
    company: "",
    position: "",
    start_date: "",
    end_date: "",
    description: "",
  };
}

export function defaultOperatorProfile(seed: {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}): OperatorProfile {
  const emailLocal = seed.email.split("@")[0] ?? "operator";
  const display = seed.displayName?.trim() || emailLocal;
  const nameParts = display.split(/\s+/).filter(Boolean);
  return {
    username: emailLocal.toLowerCase().replace(/[^a-z0-9_]/g, ""),
    display_name: display,
    personal_title: "",
    first_name: nameParts[0] ?? "",
    middle_name: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
    last_name: nameParts.length > 1 ? (nameParts[nameParts.length - 1] ?? "") : "",
    email: seed.email,
    phone_country_code: "+1",
    phone_number: "",
    personal_street_address_1: "",
    personal_street_address_2: "",
    personal_city: "",
    personal_state: "",
    personal_postal_code: "",
    personal_country: "United States",
    bio: "",
    business_position: "",
    business_company: "LiNKtrend",
    business_street_address_1: "",
    business_street_address_2: "",
    business_city: "",
    business_state: "",
    business_postal_code: "",
    business_country: "United States",
    avatar_url: seed.avatarUrl ?? null,
    education: [emptyEducationEntry()],
    work_experience: [emptyWorkEntry()],
  };
}

export function readOperatorProfile(seed: {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}): OperatorProfile {
  if (typeof window === "undefined") return defaultOperatorProfile(seed);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOperatorProfile(seed);
    const parsed = JSON.parse(raw) as Partial<OperatorProfile>;
    const base = defaultOperatorProfile(seed);
    return {
      ...base,
      ...parsed,
      email: seed.email,
      education:
        Array.isArray(parsed.education) && parsed.education.length > 0
          ? parsed.education.map((e) => ({ ...emptyEducationEntry(), ...e, id: e.id ?? generateProfileEntryId() }))
          : base.education,
      work_experience:
        Array.isArray(parsed.work_experience) && parsed.work_experience.length > 0
          ? parsed.work_experience.map((e) => ({ ...emptyWorkEntry(), ...e, id: e.id ?? generateProfileEntryId() }))
          : base.work_experience,
    };
  } catch {
    return defaultOperatorProfile(seed);
  }
}

export function writeOperatorProfile(profile: OperatorProfile): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("linkaios-operator-profile"));
}

export function operatorFullName(profile: OperatorProfile): string {
  const parts = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return profile.display_name || profile.email;
}

export function operatorInitials(profile: OperatorProfile): string {
  const first = profile.first_name?.charAt(0) ?? profile.display_name?.charAt(0) ?? "O";
  const last = profile.last_name?.charAt(0) ?? "";
  return (first + last).toUpperCase() || "OP";
}
