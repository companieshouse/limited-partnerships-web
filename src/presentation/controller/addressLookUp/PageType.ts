import { PageDefault } from "../PageRouting";
import PageType from "../PageType";

enum AddressPageType {
  // LIMITED PARTNERSHIP

  // registered office address
  postcodeRegisteredOfficeAddress = "postcode-registered-office-address",
  chooseRegisteredOfficeAddress = "choose-registered-office-address",
  enterRegisteredOfficeAddress = "enter-registered-office-address",
  confirmRegisteredOfficeAddress = "confirm-registered-office-address",

  // principal place of business
  postcodePrincipalPlaceOfBusinessAddress = "postcode-principal-place-of-business",
  choosePrincipalPlaceOfBusinessAddress = "choose-principal-place-of-business",
  enterPrincipalPlaceOfBusinessAddress = "enter-principal-place-of-business",
  confirmPrincipalPlaceOfBusinessAddress = "confirm-principal-place-of-business",

  // GENERAL PARTNER

  // usual residential address - Person
  territoryChoiceGeneralPartnerUsualResidentialAddress = "uk-or-overseas-general-partner-usual-residential-address",
  postcodeGeneralPartnerUsualResidentialAddress = "postcode-general-partner-usual-residential-address",
  chooseGeneralPartnerUsualResidentialAddress = "choose-general-partner-usual-residential-address",
  enterGeneralPartnerUsualResidentialAddress = "enter-general-partner-usual-residential-address",
  confirmGeneralPartnerUsualResidentialAddress = "confirm-general-partner-usual-residential-address",

  // correspondence address - Person
  territoryChoiceGeneralPartnerCorrespondenceAddress = "uk-or-overseas-general-partner-correspondence-address",
  postcodeGeneralPartnerCorrespondenceAddress = "postcode-general-partner-correspondence-address",
  chooseGeneralPartnerCorrespondenceAddress = "choose-general-partner-correspondence-address",
  enterGeneralPartnerCorrespondenceAddress = "enter-general-partner-correspondence-address",
  confirmGeneralPartnerCorrespondenceAddress = "confirm-general-partner-correspondence-address",

  // principal office address - Legal Entity
  territoryChoiceGeneralPartnerPrincipalOfficeAddress = "uk-or-overseas-general-partner-principal-office-address",
  postcodeGeneralPartnerPrincipalOfficeAddress = "postcode-general-partner-principal-office-address",
  chooseGeneralPartnerPrincipalOfficeAddress = "choose-general-partner-principal-office-address",
  enterGeneralPartnerPrincipalOfficeAddress = "enter-general-partner-principal-office-address",
  confirmGeneralPartnerPrincipalOfficeAddress = "confirm-general-partner-principal-office-address",

  // LIMITED PARTNER

  // usual residential address - Person
  territoryChoiceLimitedPartnerUsualResidentialAddress = "uk-or-overseas-limited-partner-usual-residential-address",
  postcodeLimitedPartnerUsualResidentialAddress = "postcode-limited-partner-usual-residential-address",
  chooseLimitedPartnerUsualResidentialAddress = "choose-limited-partner-usual-residential-address",
  enterLimitedPartnerUsualResidentialAddress = "enter-limited-partner-usual-residential-address",
  confirmLimitedPartnerUsualResidentialAddress = "confirm-limited-partner-usual-residential-address",

  // principal office address - Legal entity
  territoryChoiceLimitedPartnerPrincipalOfficeAddress = "uk-or-overseas-limited-partner-principal-office-address",
  postcodeLimitedPartnerPrincipalOfficeAddress = "postcode-limited-partner-principal-office-address",
  chooseLimitedPartnerPrincipalOfficeAddress = "choose-limited-partner-principal-office-address",
  enterLimitedPartnerPrincipalOfficeAddress = "enter-limited-partner-principal-office-address",
  confirmLimitedPartnerPrincipalOfficeAddress = "confirm-limited-partner-principal-office-address"
}

export const LIMITED_PARTNERSHIP_POSTCODE_PAGES: Set<PageType | PageDefault> = new Set([
  AddressPageType.postcodeRegisteredOfficeAddress,
  AddressPageType.postcodePrincipalPlaceOfBusinessAddress
]);

export const LIMITED_PARTNERSHIP_MANUAL_PAGES: Set<PageType | PageDefault> = new Set([
  AddressPageType.enterRegisteredOfficeAddress,
  AddressPageType.enterPrincipalPlaceOfBusinessAddress
]);

export const MANUAL_PAGES: Set<PageType | PageDefault> = new Set([
  ...LIMITED_PARTNERSHIP_MANUAL_PAGES,
  AddressPageType.enterGeneralPartnerUsualResidentialAddress,
  AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
  AddressPageType.enterGeneralPartnerCorrespondenceAddress,
  AddressPageType.enterLimitedPartnerUsualResidentialAddress,
  AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
]);

export const CHOOSE_PAGES: Set<PageType | PageDefault> = new Set([
  AddressPageType.chooseRegisteredOfficeAddress,
  AddressPageType.choosePrincipalPlaceOfBusinessAddress,
  AddressPageType.chooseGeneralPartnerUsualResidentialAddress,
  AddressPageType.chooseGeneralPartnerPrincipalOfficeAddress,
  AddressPageType.chooseGeneralPartnerCorrespondenceAddress,
  AddressPageType.chooseLimitedPartnerUsualResidentialAddress,
  AddressPageType.chooseLimitedPartnerPrincipalOfficeAddress
]);

export const GENERAL_PARTNER_PAGES: Set<PageType | PageDefault> = new Set([
  AddressPageType.postcodeGeneralPartnerUsualResidentialAddress,
  AddressPageType.postcodeGeneralPartnerCorrespondenceAddress,
  AddressPageType.postcodeGeneralPartnerPrincipalOfficeAddress,
  AddressPageType.enterGeneralPartnerUsualResidentialAddress,
  AddressPageType.enterGeneralPartnerCorrespondenceAddress,
  AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
  AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
  AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
  AddressPageType.confirmGeneralPartnerCorrespondenceAddress
]);

export const LIMITED_PARTNER_PAGES: Set<PageType | PageDefault> = new Set([
  AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
  AddressPageType.postcodeLimitedPartnerPrincipalOfficeAddress,
  AddressPageType.enterLimitedPartnerUsualResidentialAddress,
  AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
  AddressPageType.confirmLimitedPartnerUsualResidentialAddress,
  AddressPageType.confirmLimitedPartnerPrincipalOfficeAddress
]);

export const isConfirmGeneralPartnerAddressPageType = (pageType: string): boolean => {
  return [
    AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
    AddressPageType.confirmGeneralPartnerCorrespondenceAddress,
    AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress
  ].includes(pageType as AddressPageType);
};

export const isConfirmLimitedPartnerAddressPageType = (pageType: string): boolean => {
  return [
    AddressPageType.confirmLimitedPartnerUsualResidentialAddress,
    AddressPageType.confirmLimitedPartnerPrincipalOfficeAddress
  ].includes(pageType as AddressPageType);
};

export default AddressPageType;
