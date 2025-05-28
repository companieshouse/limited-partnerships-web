import AddressPageType from "../PageType";
import {
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "../../registration/url";
import * as url from "../url";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// usual residential address - Person

const limitedPartnerUsualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice"
};

const addressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress = {
  previousUrl: ADD_LIMITED_PARTNER_PERSON_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const addressRoutingPostcodeLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
    confirmAddressUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const addressRoutingChooseLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const addressRoutingEnterLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress
  }
};

const addressRoutingConfirmLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: REVIEW_LIMITED_PARTNERS_URL,
  pageType: AddressPageType.confirmLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const usualResidentialAddress = [
  addressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress,
  addressRoutingPostcodeLimitedPartnerUsualResidentialAddress,
  addressRoutingChooseLimitedPartnerUsualResidentialAddress,
  addressRoutingEnterLimitedPartnerUsualResidentialAddress,
  addressRoutingConfirmLimitedPartnerUsualResidentialAddress
];

// principal office address - Legal entity

const limitedPartnerPrincipalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const addressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const addressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
    confirmAddressUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const addressRoutingChooseLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
  }
};

const addressRoutingEnterLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress
  }
};

const addressRoutingConfirmLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: REVIEW_LIMITED_PARTNERS_URL,
  pageType: AddressPageType.confirmLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
  }
};

const principalOfficeAddress = [
  addressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress,
  addressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress,
  addressRoutingChooseLimitedPartnerPrincipalOfficeAddress,
  addressRoutingEnterLimitedPartnerPrincipalOfficeAddress,
  addressRoutingConfirmLimitedPartnerPrincipalOfficeAddress
];

const limitedPartnerRouting = [...usualResidentialAddress, ...principalOfficeAddress];

export default limitedPartnerRouting;
