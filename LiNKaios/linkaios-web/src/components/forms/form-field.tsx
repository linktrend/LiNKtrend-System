"use client";

import { CheckCircle2, Circle } from "lucide-react";

import {
  controlClassName,
  evaluateValidationRules,
  showFieldInvalid,
  type FieldValidationState,
  type ValidationRule,
} from "@/lib/form-validation";
import { FIELD, FORM, formatUiLabel } from "@/lib/ui-standards";

export function FormValidationHints(props: { value: string; rules: ValidationRule[]; show?: boolean }) {
  if (!props.show || props.rules.length === 0) return null;
  const results = evaluateValidationRules(props.value, props.rules);

  return (
    <ul className={FORM.validationList} aria-live="polite">
      {results.map((rule) => (
        <li
          key={rule.id}
          className={`${FORM.validationItem} ${rule.met ? FORM.validationMet : FORM.validationPending}`}
        >
          {rule.met ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden /> : <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden />}
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function FormField(props: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  value?: string;
  validationState?: FieldValidationState;
  validationRules?: ValidationRule[];
  showValidationHints?: boolean;
  children: (args: { id: string; invalid: boolean; describedBy?: string }) => React.ReactNode;
}) {
  const hintId = props.hint ? `${props.id}-hint` : undefined;
  const errorId = props.error ? `${props.id}-error` : undefined;
  const validationId = props.validationRules?.length ? `${props.id}-validation` : undefined;
  const describedBy = [hintId, errorId, validationId].filter(Boolean).join(" ") || undefined;

  const invalid = props.validationState
    ? showFieldInvalid(props.validationState, props.value ?? "", props.required) || Boolean(props.error)
    : Boolean(props.error);

  return (
    <div>
      <div className={FORM.labelRow}>
        <label htmlFor={props.id} className={FIELD.label}>
          {formatUiLabel(props.label)}
          {props.required ? <span className={`ml-0.5 ${FORM.requiredAsterisk}`} aria-hidden>*</span> : null}
        </label>
        {props.required ? <span className={FORM.requiredMark}>Required</span> : null}
      </div>
      {props.children({ id: props.id, invalid, describedBy })}
      {props.hint ? (
        <p id={hintId} className={FORM.hint}>
          {props.hint}
        </p>
      ) : null}
      {props.error ? (
        <p id={errorId} className={FORM.error} role="alert">
          {props.error}
        </p>
      ) : null}
      {props.validationRules ? (
        <div id={validationId}>
          <FormValidationHints value={props.value ?? ""} rules={props.validationRules} show={props.showValidationHints} />
        </div>
      ) : null}
    </div>
  );
}

export function formInputClassName(base: string, invalid: boolean): string {
  return controlClassName(base, invalid, FORM.invalidControl);
}
