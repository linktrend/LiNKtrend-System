import type { User } from "@supabase/supabase-js";

/** Throws if Supabase Auth user is missing (server routes / actions). */
export function assertAuthenticatedUser(user: User | null | undefined): asserts user is User {
  if (!user) {
    throw new Error("Unauthorized");
  }
}

export type { User };
