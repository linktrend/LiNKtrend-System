export type PersonalAddressParts = {
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function formatPersonalPhoneDisplay(countryCode: string, phoneNumber: string): string {
  const code = countryCode.trim();
  const number = phoneNumber.trim();
  if (!code && !number) return "—";
  return `${code} ${number}`.trim();
}

/** Natural mailing address for profile view (not tax-form layout). */
export function formatPersonalAddressNatural(parts: PersonalAddressParts | null | undefined): string[] {
  if (!parts) return [];
  const lines: string[] = [];
  const street = [parts.streetAddress1.trim(), parts.streetAddress2.trim()].filter(Boolean).join(", ");
  if (street) lines.push(street);

  const cityLine = [
    [parts.city.trim(), parts.state.trim()].filter(Boolean).join(", "),
    parts.postalCode.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  if (cityLine) lines.push(cityLine);
  if (parts.country.trim()) lines.push(parts.country.trim());

  return lines;
}

/** Profile hero location: city · state+postal · country on separate lines. */
export function formatPersonalAddressHeroLines(parts: PersonalAddressParts): string[] {
  const lines: string[] = [];
  if (parts.city.trim()) lines.push(parts.city.trim());

  const statePostal = [parts.state.trim(), parts.postalCode.trim()].filter(Boolean).join(" ");
  if (statePostal) lines.push(statePostal);

  if (parts.country.trim()) lines.push(parts.country.trim());

  return lines;
}

/** Mailing address lines for read-only display (phone/address profile blocks). */
export function formatPersonalAddressLines(parts: PersonalAddressParts): string[] {
  const lines: string[] = [];
  if (parts.streetAddress1.trim()) lines.push(parts.streetAddress1.trim());
  if (parts.streetAddress2.trim()) lines.push(parts.streetAddress2.trim());

  const cityState = [parts.city.trim(), parts.state.trim()].filter(Boolean).join(" ");
  if (cityState) lines.push(cityState);

  const postalCountry = [parts.postalCode.trim(), parts.country.trim()].filter(Boolean).join(" ");
  if (postalCountry) lines.push(postalCountry);

  return lines;
}
