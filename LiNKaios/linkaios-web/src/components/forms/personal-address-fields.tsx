"use client";

import { useMemo } from "react";

import { FormField } from "@/components/forms/form-field";
import { FormSelect, FormTextInput } from "@/components/forms/form-select";
import {
  countryOptions,
  postalCodesForLocation,
  subdivisionsForCountry,
} from "@/lib/form-geo-data";
import type { PersonalAddressValue } from "@/lib/form-types";
import type { FieldValidationState } from "@/lib/form-validation";
import { requiredFieldError, showFieldInvalid } from "@/lib/form-validation";
import { FORM } from "@/lib/ui-standards";

export function PersonalAddressFields(props: {
  idPrefix: string;
  value: PersonalAddressValue;
  onChange: (patch: Partial<PersonalAddressValue>) => void;
  required?: Partial<Record<keyof PersonalAddressValue, boolean>>;
  validationState?: Partial<Record<keyof PersonalAddressValue, FieldValidationState>>;
  submitted?: boolean;
  layout?: "row" | "card";
}) {
  const subdivisions = useMemo(() => subdivisionsForCountry(props.value.country), [props.value.country]);
  const postalOptions = useMemo(
    () => postalCodesForLocation(props.value.country, props.value.state, props.value.city),
    [props.value.country, props.value.state, props.value.city],
  );

  function patch(next: Partial<PersonalAddressValue>) {
    props.onChange(next);
  }

  function onCountryChange(country: string) {
    patch({ country, state: "", postalCode: "" });
  }

  function onStateChange(state: string) {
    patch({ state, postalCode: "" });
  }

  function onCityChange(city: string) {
    patch({ city, postalCode: "" });
  }

  function stateFor(key: keyof PersonalAddressValue): FieldValidationState {
    return {
      touched: props.validationState?.[key]?.touched ?? false,
      submitted: props.submitted ?? props.validationState?.[key]?.submitted ?? false,
      error: props.validationState?.[key]?.error,
    };
  }

  function invalidFor(key: keyof PersonalAddressValue, value: string, isRequired?: boolean): boolean {
    const st = stateFor(key);
    if (st.error) return true;
    return showFieldInvalid(st, value, isRequired);
  }

  return (
    <div className={props.layout === "card" ? FORM.fieldGroupCard : FORM.fieldGroup}>
      <FormField id={`${props.idPrefix}-street-1`} label="Street Address">
        {({ id, describedBy }) => (
          <FormTextInput id={id} describedBy={describedBy} value={props.value.streetAddress1} onChange={(streetAddress1) => patch({ streetAddress1 })} />
        )}
      </FormField>

      <FormField id={`${props.idPrefix}-street-2`} label="Address Line 2">
        {({ id, describedBy }) => (
          <FormTextInput id={id} describedBy={describedBy} value={props.value.streetAddress2} onChange={(streetAddress2) => patch({ streetAddress2 })} />
        )}
      </FormField>

      <FormField id={`${props.idPrefix}-city`} label="City">
        {({ id, describedBy }) => (
          <FormTextInput id={id} describedBy={describedBy} value={props.value.city} onChange={onCityChange} />
        )}
      </FormField>

      <FormField id={`${props.idPrefix}-state`} label="State / Region">
        {({ id, describedBy }) =>
          subdivisions ? (
            <FormSelect
              id={id}
              describedBy={describedBy}
              value={props.value.state}
              onChange={onStateChange}
              placeholder="Select state / region"
              options={subdivisions.map((state) => ({ value: state, label: state }))}
            />
          ) : (
            <FormTextInput id={id} describedBy={describedBy} value={props.value.state} onChange={(state) => patch({ state })} />
          )
        }
      </FormField>

      <FormField id={`${props.idPrefix}-postal`} label="Postal Code">
        {({ id, describedBy }) =>
          postalOptions ? (
            <FormSelect
              id={id}
              describedBy={describedBy}
              value={props.value.postalCode}
              onChange={(postalCode) => patch({ postalCode })}
              placeholder="Select postal code"
              options={postalOptions.map((code) => ({ value: code, label: code }))}
            />
          ) : (
            <FormTextInput id={id} describedBy={describedBy} value={props.value.postalCode} onChange={(postalCode) => patch({ postalCode })} />
          )
        }
      </FormField>

      <FormField
        id={`${props.idPrefix}-country`}
        label="Country"
        required={props.required?.country}
        value={props.value.country}
        validationState={stateFor("country")}
        error={
          invalidFor("country", props.value.country, props.required?.country)
            ? stateFor("country").error ?? requiredFieldError(props.value.country, "Country")
            : null
        }
      >
        {({ id, invalid, describedBy }) => (
          <FormSelect
            id={id}
            describedBy={describedBy}
            invalid={invalid}
            value={props.value.country}
            onChange={onCountryChange}
            placeholder="Select country"
            options={countryOptions()}
          />
        )}
      </FormField>
    </div>
  );
}
