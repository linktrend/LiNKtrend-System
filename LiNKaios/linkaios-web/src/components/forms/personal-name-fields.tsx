"use client";

import { FormField } from "@/components/forms/form-field";
import { FormSelect, FormTextInput } from "@/components/forms/form-select";
import { PERSONAL_TITLE_OPTIONS, phoneDialOptions } from "@/lib/form-geo-data";
import type { PersonalNameValue } from "@/lib/form-types";
import type { FieldValidationState } from "@/lib/form-validation";
import { requiredFieldError, showFieldInvalid } from "@/lib/form-validation";
import { FORM } from "@/lib/ui-standards";

export function PersonalNameFields(props: {
  idPrefix: string;
  value: PersonalNameValue;
  onChange: (patch: Partial<PersonalNameValue>) => void;
  required?: Partial<Record<keyof PersonalNameValue, boolean>>;
  validationState?: Partial<Record<keyof PersonalNameValue, FieldValidationState>>;
  submitted?: boolean;
}) {
  const required = {
    nameTitle: false,
    firstName: true,
    middleName: false,
    lastName: true,
    ...props.required,
  };

  function stateFor(key: keyof PersonalNameValue): FieldValidationState {
    return {
      touched: props.validationState?.[key]?.touched ?? false,
      submitted: props.submitted ?? props.validationState?.[key]?.submitted ?? false,
      error: props.validationState?.[key]?.error,
    };
  }

  function invalidFor(key: keyof PersonalNameValue, value: string): boolean {
    const st = stateFor(key);
    if (st.error) return true;
    return showFieldInvalid(st, value, required[key]);
  }

  return (
    <div className={FORM.nameGroup}>
      <FormField id={`${props.idPrefix}-name-title`} label="Title">
        {({ id, describedBy }) => (
          <FormSelect
            id={id}
            describedBy={describedBy}
            value={props.value.nameTitle}
            onChange={(nameTitle) => props.onChange({ nameTitle })}
            placeholder="Select title"
            options={PERSONAL_TITLE_OPTIONS.filter(Boolean).map((title) => ({ value: title, label: title }))}
          />
        )}
      </FormField>

      <FormField
        id={`${props.idPrefix}-first-name`}
        label="First Name"
        required={required.firstName}
        value={props.value.firstName}
        validationState={stateFor("firstName")}
        error={
          invalidFor("firstName", props.value.firstName)
            ? stateFor("firstName").error ?? requiredFieldError(props.value.firstName, "First Name")
            : null
        }
      >
        {({ id, invalid, describedBy }) => (
          <FormTextInput
            id={id}
            describedBy={describedBy}
            invalid={invalid}
            value={props.value.firstName}
            onChange={(firstName) => props.onChange({ firstName })}
          />
        )}
      </FormField>

      <FormField id={`${props.idPrefix}-middle-name`} label="Middle Name">
        {({ id, describedBy }) => (
          <FormTextInput id={id} describedBy={describedBy} value={props.value.middleName} onChange={(middleName) => props.onChange({ middleName })} />
        )}
      </FormField>

      <FormField
        id={`${props.idPrefix}-last-name`}
        label="Last Name"
        required={required.lastName}
        value={props.value.lastName}
        validationState={stateFor("lastName")}
        error={
          invalidFor("lastName", props.value.lastName)
            ? stateFor("lastName").error ?? requiredFieldError(props.value.lastName, "Last Name")
            : null
        }
      >
        {({ id, invalid, describedBy }) => (
          <FormTextInput
            id={id}
            describedBy={describedBy}
            invalid={invalid}
            value={props.value.lastName}
            onChange={(lastName) => props.onChange({ lastName })}
          />
        )}
      </FormField>
    </div>
  );
}
