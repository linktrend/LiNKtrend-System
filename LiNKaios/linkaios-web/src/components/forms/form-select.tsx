"use client";

import { formInputClassName } from "@/components/forms/form-field";
import { FIELD, FORM } from "@/lib/ui-standards";

export function selectControlClass(opts?: { compact?: boolean; count?: boolean; fullWidth?: boolean }): string {
  if (opts?.count) return FIELD.selectCount;
  if (opts?.compact) return FIELD.selectCompact;
  return opts?.fullWidth === false ? FIELD.select : FIELD.selectFull;
}

function selectChevronWrapClass(opts?: { compact?: boolean; count?: boolean; fullWidth?: boolean }): string {
  if (opts?.count || opts?.compact) return `${FORM.selectChevronWrap} w-fit`;
  if (opts?.fullWidth === false) return `${FORM.selectChevronWrap} w-full max-w-xl`;
  return `${FORM.selectChevronWrap} w-full min-w-0`;
}

/** Native `<select>` with inset chevron — use when `FormSelect` options API is too rigid. */
export function InsetSelect({
  compact,
  fullWidth,
  invalid,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  compact?: boolean;
  /** When not compact: `true` (default) = full width; `false` = max-w-xl */
  fullWidth?: boolean;
  invalid?: boolean;
}) {
  const base = selectControlClass({
    compact,
    fullWidth: compact ? false : (fullWidth ?? true),
  });
  const chevron = compact ? FORM.selectChevronCompact : FORM.selectChevron;
  const wrapClass = selectChevronWrapClass({
    compact,
    fullWidth: compact ? false : (fullWidth ?? true),
  });

  return (
    <div className={wrapClass}>
      <select
        {...rest}
        className={formInputClassName([base, className].filter(Boolean).join(" "), Boolean(invalid))}
      >
        {children}
      </select>
      <span className={chevron} aria-hidden />
    </div>
  );
}

export function FormSelect(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  fullWidth?: boolean;
  compact?: boolean;
  /** Fixed narrow width for 0–N count dropdowns */
  count?: boolean;
  disabled?: boolean;
}) {
  const base = selectControlClass({ compact: props.compact, count: props.count, fullWidth: props.fullWidth });
  const chevron = props.compact ? FORM.selectChevronCompact : FORM.selectChevron;
  const wrapClass = selectChevronWrapClass({
    compact: props.compact,
    count: props.count,
    fullWidth: props.fullWidth,
  });

  return (
    <div className={wrapClass}>
      <select
        id={props.id}
        value={props.value}
        disabled={props.disabled}
        aria-invalid={props.invalid || undefined}
        aria-describedby={props.describedBy}
        onChange={(event) => props.onChange(event.target.value)}
        className={formInputClassName(base, Boolean(props.invalid))}
      >
        {props.placeholder ? (
          <option value="" disabled>
            {props.placeholder}
          </option>
        ) : null}
        {props.options.map((option) => (
          <option key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={chevron} aria-hidden />
    </div>
  );
}

export function FormTextInput(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  type?: string;
  placeholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
}) {
  const base = props.fullWidth === false ? FIELD.control : FIELD.controlFull;

  return (
    <input
      id={props.id}
      type={props.type ?? "text"}
      value={props.value}
      required={props.required}
      disabled={props.disabled}
      placeholder={props.placeholder}
      aria-invalid={props.invalid || undefined}
      aria-describedby={props.describedBy}
      onChange={(event) => props.onChange(event.target.value)}
      className={formInputClassName(base, Boolean(props.invalid))}
    />
  );
}

export function FormTextarea(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  /** Default true — spans the full form width; set false for max-w-3xl panels. */
  fullWidth?: boolean;
}) {
  const base = props.fullWidth === false ? FIELD.textarea : FIELD.textareaFull;

  return (
    <textarea
      id={props.id}
      rows={props.rows ?? 3}
      value={props.value}
      required={props.required}
      disabled={props.disabled}
      placeholder={props.placeholder}
      aria-invalid={props.invalid || undefined}
      aria-describedby={props.describedBy}
      onChange={(event) => props.onChange(event.target.value)}
      className={formInputClassName(base, Boolean(props.invalid))}
    />
  );
}
