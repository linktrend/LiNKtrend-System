import { InsetSelect } from "@/components/forms";
import { COLLECTIVE_TAG_OPTIONS } from "@/lib/collective-linkbrain";
import { FIELD, FORM } from "@/lib/ui-standards";

/** Required collective tags for human-created memory items (licensee side). */
export function MemoryItemTagFields(props: { compact?: boolean }) {
  return (
    <div className={props.compact ? "grid gap-3 sm:grid-cols-3" : "grid gap-4 sm:grid-cols-3"}>
      {COLLECTIVE_TAG_OPTIONS.map((group) => (
        <label key={group.key} className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-600 dark:text-zinc-400`}>
            {group.label} <span className="text-red-600 dark:text-red-400">*</span>
          </span>
          <InsetSelect compact={props.compact} name={`tag${group.key.charAt(0).toUpperCase()}${group.key.slice(1)}`} required defaultValue="">
            <option value="" disabled>
              Select {group.label.toLowerCase()}…
            </option>
            {group.values.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </InsetSelect>
        </label>
      ))}
    </div>
  );
}
