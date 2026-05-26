export type ValidationRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

export type FieldValidationState = {
  touched: boolean;
  submitted: boolean;
  error?: string | null;
};

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function evaluateValidationRules(value: string, rules: ValidationRule[]): { id: string; label: string; met: boolean }[] {
  return rules.map((rule) => ({ id: rule.id, label: rule.label, met: rule.test(value) }));
}

export function allRulesMet(value: string, rules: ValidationRule[]): boolean {
  return rules.every((rule) => rule.test(value));
}

export const EMAIL_VALIDATION_RULES: ValidationRule[] = [
  { id: "email-at", label: "Contains @", test: (v) => v.includes("@") },
  { id: "email-domain", label: "Includes a domain", test: (v) => /@.+\..+/.test(v) },
  { id: "email-format", label: "Valid email format", test: isValidEmail },
];

export const USERNAME_VALIDATION_RULES: ValidationRule[] = [
  { id: "username-length", label: "At least 3 characters", test: (v) => v.trim().length >= 3 },
  {
    id: "username-chars",
    label: "Lowercase letters, numbers, underscores only",
    test: (v) => /^[a-z0-9_]*$/.test(v),
  },
];

export function requiredFieldError(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`;
}

export function showFieldInvalid(state: FieldValidationState, value: string, required?: boolean): boolean {
  if (state.error) return true;
  if (!required) return false;
  return (state.touched || state.submitted) && !value.trim();
}

export function controlClassName(base: string, invalid: boolean, invalidClass: string): string {
  return invalid ? `${base} ${invalidClass}` : base;
}
