/** Shared copy and routes for login legal acceptance (licensee + licensor admin). */

export const LOGIN_LEGAL_ROUTES = {
  terms: "/legal/terms",
  privacy: "/legal/privacy",
} as const;

export const LOGIN_LOST_ACCESS_PATH = "/login/lost-access";

export const LOGIN_LEGAL_COPY = {
  acceptanceLabel: "I agree to the Terms & Conditions and Privacy Policy",
  termsLink: "Terms & Conditions",
  privacyLink: "Privacy Policy",
  copyright: (year: number) => `© ${year} LiNKtrend. All rights reserved.`,
  lostAccessLink: "Lost access?",
} as const;
