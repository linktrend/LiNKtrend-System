import { getInMemoryLinkdeveloperClient } from "./stub-client";
import type { LinkdeveloperAdminClient } from "./types";

export function getLinkdeveloperAdminClient(
  env: Record<string, string | undefined> = process.env,
): LinkdeveloperAdminClient {
  const baseUrl = env.LINKDEVELOPER_SERVICE_URL?.trim();
  if (baseUrl) {
    // HTTP client lands when LINKDEVELOPER_SERVICE_URL is set on VPS (Wave 5.8 / 8.10).
    return getInMemoryLinkdeveloperClient();
  }
  return getInMemoryLinkdeveloperClient();
}
