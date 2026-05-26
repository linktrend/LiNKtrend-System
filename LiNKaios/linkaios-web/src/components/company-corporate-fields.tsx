"use client";

import {
  FormDatePicker,
  FormField,
  FormTextInput,
  FormTextarea,
  PersonalAddressFields,
  PersonalPhoneFields,
} from "@/components/forms";
import type { CorporateProfileFixture } from "@/lib/company-fixtures";
import { EMAIL_VALIDATION_RULES } from "@/lib/form-validation";
import type { PersonalAddressValue } from "@/lib/form-types";
import { FORM } from "@/lib/ui-standards";

type ProfilePatch = Partial<CorporateProfileFixture>;

export function CompanyCorporateBasicFields(props: {
  profile: CorporateProfileFixture;
  onChange: (patch: ProfilePatch) => void;
}) {
  const { profile, onChange } = props;

  return (
    <div className="space-y-4">
      <FormField id="corp-registered-name" label="Company Name">
        {({ id, describedBy }) => (
          <FormTextInput
            id={id}
            describedBy={describedBy}
            value={profile.registeredName}
            onChange={(registeredName) => onChange({ registeredName })}
          />
        )}
      </FormField>

      <FormField id="corp-trading-names" label="Trading Names / Aliases">
        {({ id, describedBy }) => (
          <FormTextInput
            id={id}
            describedBy={describedBy}
            value={profile.tradingNames}
            onChange={(tradingNames) => onChange({ tradingNames })}
          />
        )}
      </FormField>

      <div className={FORM.fieldGroup}>
        <FormField id="corp-registration-number" label="Registration / ID Number">
          {({ id, describedBy }) => (
            <FormTextInput
              id={id}
              describedBy={describedBy}
              value={profile.registrationNumber}
              onChange={(registrationNumber) => onChange({ registrationNumber })}
            />
          )}
        </FormField>

        <FormField id="corp-incorporation-date" label="Date of Incorporation">
          {({ id, describedBy }) => (
            <FormDatePicker
              id={id}
              describedBy={describedBy}
              value={profile.incorporationDate}
              onChange={(incorporationDate) => onChange({ incorporationDate })}
              placeholder="Select incorporation date"
            />
          )}
        </FormField>
      </div>

      <div className={FORM.fieldGroup}>
        <FormField id="corp-financial-year-end" label="Financial Year End">
          {({ id, describedBy }) => (
            <FormTextInput
              id={id}
              describedBy={describedBy}
              value={profile.financialYearEnd}
              onChange={(financialYearEnd) => onChange({ financialYearEnd })}
            />
          )}
        </FormField>

        <FormField
          id="corp-agm-due-date"
          label="AGM Due Date"
          hint="Statutory annual general meeting due date."
        >
          {({ id, describedBy }) => (
            <FormDatePicker
              id={id}
              describedBy={describedBy}
              value={profile.agmDueDate}
              onChange={(agmDueDate) => onChange({ agmDueDate })}
              placeholder="Select AGM due date"
            />
          )}
        </FormField>
      </div>

      <FormField id="corp-business-activities" label="Business Activities">
        {({ id, describedBy }) => (
          <FormTextarea
            id={id}
            describedBy={describedBy}
            rows={3}
            value={profile.businessActivities}
            onChange={(businessActivities) => onChange({ businessActivities })}
          />
        )}
      </FormField>

      <FormField id="corp-industry-code" label="Industry Classification">
        {({ id, describedBy }) => (
          <FormTextInput
            id={id}
            describedBy={describedBy}
            value={profile.industryCode}
            onChange={(industryCode) => onChange({ industryCode })}
          />
        )}
      </FormField>
    </div>
  );
}

function addressSection(
  title: string,
  idPrefix: string,
  value: PersonalAddressValue,
  onChange: (patch: Partial<PersonalAddressValue>) => void,
) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h4>
      <PersonalAddressFields idPrefix={idPrefix} value={value} onChange={onChange} />
    </div>
  );
}

export function CompanyCorporateContactFields(props: {
  profile: CorporateProfileFixture;
  onChange: (patch: ProfilePatch) => void;
}) {
  const { profile, onChange } = props;

  return (
    <div className="space-y-6">
      {addressSection("Registered office", "registered-office", profile.registeredOffice, (patch) =>
        onChange({ registeredOffice: { ...profile.registeredOffice, ...patch } }),
      )}

      {addressSection("Principal place of business", "principal-place", profile.principalPlace, (patch) =>
        onChange({ principalPlace: { ...profile.principalPlace, ...patch } }),
      )}

      <PersonalPhoneFields
        idPrefix="company"
        value={{ phoneCountryCode: profile.phoneCountryCode, phoneNumber: profile.phoneNumber }}
        onChange={(patch) => onChange(patch)}
      />

      <FormField
        id="corp-email"
        label="Email"
        value={profile.email}
        validationRules={EMAIL_VALIDATION_RULES}
        showValidationHints={Boolean(profile.email.trim())}
        hint="Official company contact email."
      >
        {({ id, describedBy }) => (
          <FormTextInput
            id={id}
            describedBy={describedBy}
            type="email"
            value={profile.email}
            onChange={(email) => onChange({ email })}
            placeholder="ops@company.example"
          />
        )}
      </FormField>

      <FormField id="corp-website" label="Website" hint="Include https:// when available.">
        {({ id, describedBy }) => (
          <FormTextInput
            id={id}
            describedBy={describedBy}
            value={profile.website}
            onChange={(website) => onChange({ website })}
            placeholder="https://company.example"
          />
        )}
      </FormField>
    </div>
  );
}

export function CompanyCorporateFinancialFields(props: {
  profile: CorporateProfileFixture;
  onChange: (patch: ProfilePatch) => void;
}) {
  const { profile, onChange } = props;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Share capital</h4>
        <div className={FORM.fieldGroup}>
          <FormField id="corp-share-count" label="Number of Shares" hint="Issued and paid-up share count.">
            {({ id, describedBy }) => (
              <FormTextInput
                id={id}
                describedBy={describedBy}
                value={profile.shareCount}
                onChange={(shareCount) => onChange({ shareCount })}
                placeholder="10,000"
              />
            )}
          </FormField>

          <FormField id="corp-share-capital-amount" label="Share Capital Amount" hint="Nominal or paid-up capital value.">
            {({ id, describedBy }) => (
              <FormTextInput
                id={id}
                describedBy={describedBy}
                value={profile.shareCapitalAmount}
                onChange={(shareCapitalAmount) => onChange({ shareCapitalAmount })}
                placeholder="$10,000"
              />
            )}
          </FormField>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Financial documents / filings</h4>
        <div className={FORM.fieldGroup}>
          <FormField id="corp-financial-filing-description" label="Filing Description">
            {({ id, describedBy }) => (
              <FormTextInput
                id={id}
                describedBy={describedBy}
                value={profile.financialFilingDescription}
                onChange={(financialFilingDescription) => onChange({ financialFilingDescription })}
                placeholder="Annual return"
              />
            )}
          </FormField>

          <FormField id="corp-financial-filing-date" label="Filing Date">
            {({ id, describedBy }) => (
              <FormDatePicker
                id={id}
                describedBy={describedBy}
                value={profile.financialFilingDate}
                onChange={(financialFilingDate) => onChange({ financialFilingDate })}
                placeholder="Select filing date"
              />
            )}
          </FormField>
        </div>
      </div>
    </div>
  );
}
