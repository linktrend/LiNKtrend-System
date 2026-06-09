"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useAppRole } from "@/components/role-preview-provider";
import { TitledCardHeader } from "@/components/titled-card-header";
import { canEditCompanyProfile } from "@/lib/app-roles";
import { BUTTON, CARD, formatCardTitle } from "@/lib/ui-standards";

export function CompanyEditableCard(props: {
  icon: LucideIcon;
  title: string;
  description?: string;
  required?: boolean;
  /** When false, omit Optional/Required suffix (system read-only fields). */
  showRequirementLabel?: boolean;
  children: React.ReactNode;
  editContent?: React.ReactNode;
  onSave?: () => void | Promise<void>;
  onEditStart?: () => void;
  onCancelEdit?: () => void;
  saveDisabled?: boolean;
}) {
  const { kind, role } = useAppRole();
  const canEdit = canEditCompanyProfile(kind, role);
  const editable = Boolean(props.editContent) && canEdit;
  const [editing, setEditing] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!savedFlash) return;
    const t = window.setTimeout(() => setSavedFlash(false), 3500);
    return () => window.clearTimeout(t);
  }, [savedFlash]);

  async function handleSave() {
    await props.onSave?.();
    setEditing(false);
    setSavedFlash(true);
  }

  const showRequirementLabel = props.showRequirementLabel !== false;
  const title = (
    <>
      {formatCardTitle(props.title)}
      {showRequirementLabel ? (
        props.required ? (
          <span className="ml-2 text-xs font-normal text-rose-700 dark:text-rose-300">Required</span>
        ) : (
          <span className="ml-2 text-xs font-normal text-zinc-400">Optional</span>
        )
      ) : null}
    </>
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <TitledCardHeader
        icon={props.icon}
        title={title}
        description={props.description}
        titleClassName={CARD.titleMd}
        action={
          editable ? (
            <div className="flex shrink-0 gap-2">
              {editing ? (
                <>
                  <button
                    type="button"
                    className={BUTTON.secondaryTight}
                    onClick={() => {
                      props.onCancelEdit?.();
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={BUTTON.primaryTight}
                    disabled={props.saveDisabled}
                    onClick={() => void handleSave()}
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={BUTTON.editTight}
                  onClick={() => {
                    props.onEditStart?.();
                    setEditing(true);
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          ) : null
        }
      />
      {savedFlash ? (
        <p role="status" className="mt-3 text-xs text-emerald-700 dark:text-emerald-300">
          Saved — preview only until company profile storage is wired.
        </p>
      ) : null}
      <div className={`mt-4 ${CARD.contentInset}`}>{editable && editing ? props.editContent : props.children}</div>
    </section>
  );
}
