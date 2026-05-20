"use client";

import { useEffect, useId, useRef, useState } from "react";

import { COMPANY_SECTION_COPY } from "@/lib/company-page-copy";
import type { LocationFixture } from "@/lib/company-fixtures";
import { BUTTON, FIELD } from "@/lib/ui-standards";

export function CompanyAddLocationModal(props: {
  open: boolean;
  onClose: () => void;
  onAdd: (row: LocationFixture) => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [site, setSite] = useState("");
  const [role, setRole] = useState("Branch");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (props.open) {
      closeRef.current?.focus();
      setSite("");
      setRole("Branch");
      setCity("");
    }
  }, [props.open]);

  if (!props.open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedSite = site.trim();
    if (!trimmedSite) return;
    props.onAdd({
      id: `local-${Date.now()}`,
      site: trimmedSite,
      role: role.trim() || "Branch",
      city: city.trim() || "—",
    });
    props.onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 dark:bg-black/60"
        aria-label="Close dialog"
        onClick={props.onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
      >
        <h2 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {COMPANY_SECTION_COPY.locations.modalTitle}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{COMPANY_SECTION_COPY.locations.modalHint}</p>

        <label className="mt-4 block">
          <span className={FIELD.label}>Site name</span>
          <input
            required
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="e.g. HQ — Downtown"
            className={`mt-1 ${FIELD.control}`}
          />
        </label>
        <label className="mt-3 block">
          <span className={FIELD.label}>Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={`mt-1 ${FIELD.control}`}>
            <option value="Headquarters">Headquarters</option>
            <option value="Branch">Branch</option>
            <option value="Clinic">Clinic</option>
            <option value="Store">Store</option>
          </select>
        </label>
        <label className="mt-3 block">
          <span className={FIELD.label}>City / region</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Miami, FL"
            className={`mt-1 ${FIELD.control}`}
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
          <button ref={closeRef} type="button" className={BUTTON.secondaryRow} onClick={props.onClose}>
            Cancel
          </button>
          <button type="submit" className={BUTTON.primaryRow}>
            Add location
          </button>
        </div>
      </form>
    </div>
  );
}
