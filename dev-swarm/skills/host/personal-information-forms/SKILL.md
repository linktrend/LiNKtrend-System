---
name: personal-information-forms
description: >-
  LiNKaios form system — stacked labels (FormField / FORM.fieldStack), inset select chevrons
  (FormSelect / InsetSelect), and PII field groups (name, address, phone). Use for any settings,
  profile, company, or modal form in linkaios-web, not only personal data.
---

# LiNKaios Form Fields

## Global rules (all forms)

**Stacked label + control**

- Use **`FormField`** for settings pages, modals, and request forms (label row + `mb-1.5` gap).
- Never `<label><span className={FIELD.label}>…</span><input className="mt-1 …">` — that crowds the label against the control.
- Raw `<label>` only with **`FORM.fieldStack`** (`flex flex-col gap-1.5`).

**Every `<select>`**

- **`FormSelect`** when you have a value/onChange + options list.
- **`InsetSelect`** for native props (`name`, `defaultValue`, `optgroup`, table cells).
- Forbidden: `FIELD.control`, `FIELD.controlCompact`, or `FIELD.controlFull` on `<select>` (native chevron sits flush on the right edge).

**Chevron inset** (Gender-style reference)

- `appearance-none` + `pr-10` on standard selects; custom triangle at `FORM.selectChevron` (`right-3.5`).
- Compact table selects: `FIELD.selectCompact` + `FORM.selectChevronCompact` (`right-2.5`, `pr-8`).

See `.cursor/rules/07-ui-and-frontend-standards.mdc` → **Form fields**.

## When to use (PII blocks)

Any form collecting **personal identity or contact data** in `LiNKaios/linkaios-web`:

- Operator profile (Settings → Profile)
- Company directors, officers, shareholders
- Future tenant/user onboarding or CRM contact forms

Do **not** hand-roll name/address/phone field groups. Use the shared components.

## Canonical components

Import from `@/components/forms`:

| Component | Purpose |
|-----------|---------|
| `PersonalNameFields` | Title (dropdown) + First + Middle + Last |
| `PersonalAddressFields` | Street 1/2, City, State/Region, Postal, Country |
| `PersonalPhoneFields` | Country code (country name + dial code) + number |
| `FormField` | Label, Required marker, hint, error, validation rule list |
| `FormSelect` | Dropdown with **inset chevron** (`FORM.selectChevron`) |
| `FormTextInput` | Text input with invalid border support |
| `FormTextarea` | Multi-line text (`FIELD.textarea`) |
| `InsetSelect` | Native `<select>` wrapper when `FormSelect` options API is too rigid |

Geo data and options: `@/lib/form-geo-data.ts`  
Validation helpers: `@/lib/form-validation.ts`  
Layout tokens: `FORM` and `FIELD.select*` in `@/lib/ui-standards.ts`

## Field rules (mandatory)

### Name block

Always four fields in one row on desktop (`FORM.nameGroup`):

1. **Title** — dropdown (`PERSONAL_TITLE_OPTIONS`: Mr., Mrs., Ms., Dr., …)
2. **First Name** — required by default
3. **Middle Name** — optional
4. **Last Name** — required by default

### Address block

Always six fields (`FORM.fieldGroup`):

1. Street Address  
2. Address Line 2  
3. City  
4. State / Region — **dropdown** when subdivisions exist for selected country (`subdivisionsForCountry`)  
5. Postal Code — **dropdown** when lookup exists for country + state + city (`postalCodesForLocation`); otherwise free text  
6. Country — **dropdown**, all countries alphabetical (`countryOptions()`)

When country changes, reset state and postal code. When state or city changes, reset postal code.

### Phone block

1. **Country Code** — dropdown: `{Country name} (+code)` via `phoneDialOptions()`  
2. **Phone Number** — text; placeholder `5551234567`; hint for digits-only

### Required fields

- Show red asterisk on label **and** `Required` text aligned top-right (`FORM.requiredMark`)
- On submit, empty required fields get red border (`FORM.invalidControl`) and inline error
- Pass `submitted` or `validationState` with `touched` / `submitted` flags

### Validation & hints

- Placeholders for format examples (`you@company.com`, `johndoe`)
- Helper text below field (`FORM.hint`) or beside field in small text
- Live requirement lists via `FormField` + `validationRules` + `FormValidationHints` (green check when met)
- Email: use `EMAIL_VALIDATION_RULES`; username: `USERNAME_VALIDATION_RULES`

### Select chevron

Never use raw `<select className={FIELD.control*}>` anywhere in linkaios-web.

Use `FormSelect` or `InsetSelect` — chevron is inset at `right-3.5` (standard) or `right-2.5` (compact), not flush to the border.

## UX guidelines (also apply)

In addition to the field rules above, follow established form UX practice:

- **Single-column groups** for related fields; avoid multi-column wizard layouts on mobile ([Baymard / IxDF](https://ixdf.org/literature/article/ui-form-design))
- **Group related fields** (name block, address block, phone block) with consistent spacing
- **Keep forms concise** — only ask for data you need ([CXL form design](https://cxl.com/blog/form-design-best-practices/))
- **Simple questions first**, sensitive fields later
- **Inline validation** over submit-only errors when requirements are known
- **Clear labels** above fields (Title Case via `formatUiLabel`); never rely on placeholder alone
- **Accessible errors** — `aria-invalid`, `aria-describedby`, `role="alert"` on error text

References:

- [CXL — Form Design Best Practices](https://cxl.com/blog/form-design-best-practices/)
- [IxDF — UI Form Design](https://ixdf.org/literature/article/ui-form-design)
- [UX Design Institute — Guide to Form Design](https://www.uxdesigninstitute.com/blog/guide-to-form-design-with-tips/)

## Migration checklist

When touching an existing form:

1. Replace inline name/address/phone markup with shared components  
2. Replace raw `<select>` with `FormSelect`  
3. Wire `submitted` on save attempt for required highlighting  
4. Add validation rules where format matters (email, username, password)  
5. Do not duplicate country/state/postal lists — extend `form-geo-data.ts`

## Proof

After changes:

```bash
cd LiNKaios/linkaios-web && npm run typecheck
```

Manually verify Profile → Basic Information, Contact Details, Business Information, and Company → Overview people edit cards.
