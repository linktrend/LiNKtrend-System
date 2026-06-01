/**
 * LiNKguard confidentiality hooks for anonymized world brain contributions (LTS-050).
 */

const FORBIDDEN_KEYS = [
  "email",
  "phone",
  "contact_email",
  "contact_phone",
  "tenant_id",
  "business_name",
  "contact",
] as const;

export type WorldBrainConfidentialityResult =
  | {
      allowed: true;
      anonymized: Record<string, unknown>;
      proof: {
        policy: "linkguard.world_brain.v1";
        stripped_keys: string[];
        tenant_identifiers_removed: boolean;
      };
    }
  | {
      allowed: false;
      reason: string;
      blocked_keys: string[];
    };

function containsForbiddenKey(value: unknown, path = ""): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => containsForbiddenKey(item, `${path}[${index}]`));
  }
  if (typeof value === "object") {
    const blocked: string[] = [];
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const fullKey = path ? `${path}.${key}` : key;
      if ((FORBIDDEN_KEYS as readonly string[]).includes(key.toLowerCase())) {
        blocked.push(fullKey);
      }
      blocked.push(...containsForbiddenKey(nested, fullKey));
    }
    return blocked;
  }
  if (typeof value === "string" && /tenant-[a-z0-9-]{8,}/i.test(value)) {
    return [path || "value"];
  }
  return [];
}

function redactString(value: string): string {
  return value
    .replace(/tenant-[a-z0-9-]+/gi, "tenant-redacted")
    .replace(/@[a-z0-9._-]+/gi, "user-redacted")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "email-redacted");
}

function deepAnonymize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepAnonymize);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if ((FORBIDDEN_KEYS as readonly string[]).includes(key.toLowerCase())) {
        continue;
      }
      out[key] = deepAnonymize(nested);
    }
    return out;
  }
  if (typeof value === "string") {
    return redactString(value);
  }
  return value;
}

export function evaluateWorldBrainContribution(
  payload: Record<string, unknown>,
): WorldBrainConfidentialityResult {
  const blocked_keys = containsForbiddenKey(payload);
  if (blocked_keys.length > 0) {
    return {
      allowed: false,
      reason: "World brain contribution blocked until confidential fields are removed",
      blocked_keys,
    };
  }

  const anonymized = deepAnonymize(payload) as Record<string, unknown>;
  return {
    allowed: true,
    anonymized,
    proof: {
      policy: "linkguard.world_brain.v1",
      stripped_keys: [...FORBIDDEN_KEYS],
      tenant_identifiers_removed: true,
    },
  };
}
