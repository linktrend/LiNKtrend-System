/** Shared personal-information field shapes for profile and company people forms. */

export type PersonalNameValue = {
  nameTitle: string;
  firstName: string;
  middleName: string;
  lastName: string;
};

export type PersonalAddressValue = {
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type PersonalPhoneValue = {
  phoneCountryCode: string;
  phoneNumber: string;
};

export type PersonalContactValue = PersonalNameValue &
  PersonalAddressValue &
  PersonalPhoneValue & {
    email: string;
  };
