"use client";

import {
  FormField,
  PersonalAddressFields,
  PersonalNameFields,
  PersonalPhoneFields,
  FormSelect,
  FormTextInput,
} from "@/components/forms";
import {
  OFFICER_ROLE_OPTIONS,
  type CompanyDirector,
  type CompanyOfficer,
  type CompanyOfficerRole,
  type CompanyPersonContact,
  type CompanyShareholder,
} from "@/lib/company-people";
import { EMAIL_VALIDATION_RULES } from "@/lib/form-validation";

function personToName(person: CompanyPersonContact) {
  return {
    nameTitle: person.nameTitle,
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
  };
}

function personToAddress(person: CompanyPersonContact) {
  return {
    streetAddress1: person.streetAddress1,
    streetAddress2: person.streetAddress2,
    city: person.city,
    state: person.state,
    postalCode: person.postalCode,
    country: person.country,
  };
}

function personToPhone(person: CompanyPersonContact) {
  return {
    phoneCountryCode: person.phoneCountryCode,
    phoneNumber: person.phoneNumber,
  };
}

export function CompanyPersonFields(props: {
  idPrefix: string;
  person: CompanyPersonContact;
  onChange: (patch: Partial<CompanyPersonContact>) => void;
  heading?: string;
  children?: React.ReactNode;
  submitted?: boolean;
}) {
  const { idPrefix, person, onChange } = props;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      {props.heading ? <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{props.heading}</h4> : null}
      {props.children ? <div className={props.heading ? "mt-3" : undefined}>{props.children}</div> : null}

      <div className={props.heading || props.children ? "mt-4 space-y-4" : "space-y-4"}>
        <PersonalNameFields
          idPrefix={idPrefix}
          layout="card"
          value={personToName(person)}
          onChange={(patch) => onChange(patch)}
          submitted={props.submitted}
        />

        <PersonalAddressFields
          idPrefix={idPrefix}
          layout="card"
          value={personToAddress(person)}
          onChange={(patch) => onChange(patch)}
          submitted={props.submitted}
        />

        <PersonalPhoneFields idPrefix={idPrefix} layout="card" value={personToPhone(person)} onChange={(patch) => onChange(patch)} />

        <FormField
          id={`${idPrefix}-email`}
          label="Email"
          value={person.email}
          validationRules={EMAIL_VALIDATION_RULES}
          showValidationHints={Boolean(person.email.trim())}
          hint="Use a work email when possible."
        >
          {({ id, describedBy }) => (
            <FormTextInput
              id={id}
              describedBy={describedBy}
              type="email"
              value={person.email}
              onChange={(email) => onChange({ email })}
              placeholder="you@company.com"
            />
          )}
        </FormField>
      </div>
    </div>
  );
}

export function CompanyDirectorFields(props: {
  director: CompanyDirector;
  index: number;
  onChange: (next: CompanyDirector) => void;
  submitted?: boolean;
}) {
  return (
    <CompanyPersonFields
      idPrefix={`director-${props.index}`}
      heading={`Director ${props.index + 1}`}
      person={props.director}
      submitted={props.submitted}
      onChange={(patch) => props.onChange({ ...props.director, ...patch, directorTitle: "Director" })}
    />
  );
}

export function CompanyOfficerFields(props: {
  officer: CompanyOfficer;
  index: number;
  onChange: (next: CompanyOfficer) => void;
  submitted?: boolean;
}) {
  return (
    <CompanyPersonFields
      idPrefix={`officer-${props.index}`}
      heading={`Officer ${props.index + 1}`}
      person={props.officer}
      submitted={props.submitted}
      onChange={(patch) => props.onChange({ ...props.officer, ...patch })}
    >
      <div className="space-y-4">
        <FormField id={`officer-${props.index}-role`} label="Officer Role" required>
          {({ id, describedBy }) => (
            <FormSelect
              id={id}
              describedBy={describedBy}
              value={props.officer.role}
              onChange={(role) => props.onChange({ ...props.officer, role: role as CompanyOfficerRole })}
              options={OFFICER_ROLE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
          )}
        </FormField>
        {props.officer.role === "other" ? (
          <FormField id={`officer-${props.index}-role-label`} label="Role Label">
            {({ id, describedBy }) => (
              <FormTextInput
                id={id}
                describedBy={describedBy}
                value={props.officer.roleLabel}
                onChange={(roleLabel) => props.onChange({ ...props.officer, roleLabel })}
                placeholder="General counsel"
              />
            )}
          </FormField>
        ) : null}
      </div>
    </CompanyPersonFields>
  );
}

export function CompanyShareholderFields(props: {
  shareholder: CompanyShareholder;
  index: number;
  onChange: (next: CompanyShareholder) => void;
  submitted?: boolean;
}) {
  return (
    <CompanyPersonFields
      idPrefix={`shareholder-${props.index}`}
      heading={`Shareholder ${props.index + 1}`}
      person={props.shareholder}
      submitted={props.submitted}
      onChange={(patch) => props.onChange({ ...props.shareholder, ...patch })}
    >
      <FormField id={`shareholder-${props.index}-ownership`} label="Ownership %" required>
        {({ id, describedBy }) => (
          <FormSelect
            id={id}
            describedBy={describedBy}
            value={String(props.shareholder.ownershipPercent)}
            onChange={(value) => props.onChange({ ...props.shareholder, ownershipPercent: Number(value) })}
            options={Array.from({ length: 21 }, (_, index) => index * 5).map((percent) => ({
              value: String(percent),
              label: `${percent}%`,
            }))}
          />
        )}
      </FormField>
    </CompanyPersonFields>
  );
}
