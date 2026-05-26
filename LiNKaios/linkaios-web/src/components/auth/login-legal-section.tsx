"use client";

import { useState } from "react";

/** Pre-checked legal acceptance state for login forms. */
export function useLoginLegalAcceptance(initial = true) {
  return useState(initial);
}
