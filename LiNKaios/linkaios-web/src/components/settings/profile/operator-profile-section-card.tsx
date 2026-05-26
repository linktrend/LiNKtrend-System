"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

import { BUTTON, CARD, PROFILE_CARD } from "@/lib/ui-standards";

export function OperatorProfileSectionCard(props: {
  icon: LucideIcon;
  title: string;
  description?: string;
  editing: boolean;
  saving?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  editable?: boolean;
  viewContent: React.ReactNode;
  editContent?: React.ReactNode;
}) {
  const Icon = props.icon;
  const editable = props.editable !== false;

  return (
    <section
      className={`${PROFILE_CARD.shell} ${props.editing ? PROFILE_CARD.shellEditing : ""} space-y-5 transition-[box-shadow,background-color] duration-200`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" aria-hidden />
          <div className="min-w-0">
            <h2 className={PROFILE_CARD.sectionTitle}>{props.title}</h2>
            {props.description ? (
              <p className={PROFILE_CARD.sectionDescription}>{props.description}</p>
            ) : null}
          </div>
        </div>
        {editable && !props.editing && props.onEdit ? (
          <button type="button" className={BUTTON.editTight} onClick={props.onEdit}>
            Edit
          </button>
        ) : null}
      </div>

      <div className={CARD.contentInset}>{props.editing ? props.editContent : props.viewContent}</div>

      {editable && props.editing && props.onSave && props.onCancel ? (
        <div className={`flex flex-wrap items-center gap-3 border-t border-zinc-200/70 pt-4 dark:border-zinc-800/70 ${CARD.contentInset}`}>
          <button type="button" className={BUTTON.primaryTight} onClick={props.onSave} disabled={props.saving}>
            {props.saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Save"}
          </button>
          <button type="button" className={BUTTON.secondaryTight} onClick={props.onCancel} disabled={props.saving}>
            Cancel
          </button>
        </div>
      ) : null}
    </section>
  );
}
