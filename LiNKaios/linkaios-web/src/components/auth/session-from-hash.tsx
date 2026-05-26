"use client";

import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Implicit-flow tokens in `#access_token=…` must become cookies before SSR can see the session. */
export function SessionFromHash() {
  useEffect(() => {
    if (!window.location.hash.includes("access_token")) return;

    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const clean = new URL(window.location.href);
      clean.hash = "";
      window.location.replace(clean.toString());
    });
  }, []);

  return null;
}
