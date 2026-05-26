"use client";

import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";

import { formInputClassName } from "@/components/forms/form-field";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatIsoDateDisplay, parseIsoDateField, toIsoDateField } from "@/lib/date-field-utils";
import { cn } from "@/lib/utils";
import { FIELD } from "@/lib/ui-standards";

const PRESENT_SENTINEL = "__present__";

export function FormDatePicker(props: {
  id: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  /** When true, renders full-width control (default). Set false for max-w-xl fields. */
  fullWidth?: boolean;
  /** Optional end-date mode: allow "Present (ongoing)" instead of a calendar date. */
  allowPresent?: boolean;
  presentLabel?: string;
  className?: string;
}) {
  const {
    id,
    name,
    value,
    defaultValue,
    onChange,
    describedBy,
    invalid,
    disabled,
    required,
    placeholder = "Pick a date",
    fullWidth = true,
    allowPresent = false,
    presentLabel = "Present (ongoing)",
    className,
  } = props;

  const initial = defaultValue ?? "";
  const [internal, setInternal] = useState(initial);
  const [open, setOpen] = useState(false);

  const isControlled = value !== undefined;
  const rawValue = isControlled ? value : internal;
  const isPresent = allowPresent && rawValue === PRESENT_SENTINEL;
  const selected = isPresent ? undefined : parseIsoDateField(rawValue);

  const setValue = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const displayLabel = useMemo(() => {
    if (isPresent) return presentLabel;
    if (selected) return formatIsoDateDisplay(toIsoDateField(selected));
    return placeholder;
  }, [isPresent, presentLabel, placeholder, selected]);

  const controlBase = fullWidth ? FIELD.controlFull : FIELD.control;

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled || isPresent}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            className={formInputClassName(
              cn(
                controlBase,
                "flex items-center justify-between gap-2 text-left font-normal",
                !selected && !isPresent && "text-zinc-500 dark:text-zinc-400",
              ),
              Boolean(invalid),
            )}
          >
            <span className="truncate">{displayLabel}</span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              setValue(toIsoDateField(date));
              setOpen(false);
            }}
            defaultMonth={selected}
          />
        </PopoverContent>
      </Popover>

      {allowPresent ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            className="rounded border-zinc-300 dark:border-zinc-600"
            checked={isPresent}
            disabled={disabled}
            onChange={(event) => {
              if (event.target.checked) {
                setValue(PRESENT_SENTINEL);
                setOpen(false);
                return;
              }
              setValue("");
            }}
          />
          <span>{presentLabel}</span>
        </label>
      ) : null}

      {name ? (
        <input
          type="hidden"
          name={name}
          value={isPresent ? "" : rawValue}
          required={required && !isPresent}
        />
      ) : null}
    </div>
  );
}

/** Compact display helper for work-history date ranges stored as ISO strings. */
export function formatDateRangeDisplay(start: string, end: string): string {
  const startLabel = start === PRESENT_SENTINEL ? "Present" : formatIsoDateDisplay(start, "");
  const endLabel = end === PRESENT_SENTINEL ? "Present" : formatIsoDateDisplay(end, "");
  const parts = [startLabel, endLabel].filter(Boolean);
  return parts.length > 0 ? parts.join(" – ") : "Dates not provided";
}

/** Normalize legacy free-text dates to ISO when possible; otherwise pass through. */
export function normalizeLegacyDateField(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.toLowerCase() === "present") return PRESENT_SENTINEL;
  const iso = parseIsoDateField(trimmed);
  if (iso) return toIsoDateField(iso);
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) return toIsoDateField(new Date(parsed));
  return trimmed;
}

export { PRESENT_SENTINEL };
