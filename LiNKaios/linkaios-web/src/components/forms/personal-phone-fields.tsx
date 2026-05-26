"use client";

import { FormField } from "@/components/forms/form-field";
import { FormSelect, FormTextInput } from "@/components/forms/form-select";
import { phoneDialOptions } from "@/lib/form-geo-data";
import type { PersonalPhoneValue } from "@/lib/form-types";
import { FORM } from "@/lib/ui-standards";

export function PersonalPhoneFields(props: {
  idPrefix: string;
  value: PersonalPhoneValue;
  onChange: (patch: Partial<PersonalPhoneValue>) => void;
  layout?: "row" | "card";
}) {
  return (
    <div className={props.layout === "card" ? FORM.fieldGroupCard : FORM.fieldGroup}>
      <FormField id={`${props.idPrefix}-phone-code`} label="Country Code">
        {({ id, describedBy }) => (
          <FormSelect
            id={id}
            describedBy={describedBy}
            value={props.value.phoneCountryCode}
            onChange={(phoneCountryCode) => props.onChange({ phoneCountryCode })}
            options={phoneDialOptions()}
          />
        )}
      </FormField>

      <FormField id={`${props.idPrefix}-phone-number`} label="Phone Number" hint="Digits only — no spaces or symbols.">
        {({ id, describedBy }) => (
          <FormTextInput
            id={id}
            describedBy={describedBy}
            value={props.value.phoneNumber}
            onChange={(phoneNumber) => props.onChange({ phoneNumber })}
            placeholder="5551234567"
          />
        )}
      </FormField>
    </div>
  );
}
