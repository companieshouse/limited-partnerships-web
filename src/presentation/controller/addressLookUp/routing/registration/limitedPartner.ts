import AddressPageType from "../../PageType";
import {
  ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "../../../registration/url";
import * as url from "../../url/registration";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// usual residential address - Person

const limitedPartnerUsualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice"
};

const registrationAddressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress = {
  previousUrl: ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const registrationAddressRoutingPostcodeLimitedPartnerUsualResidentialAddress = {
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

const registrationAddressRoutingChooseLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const registrationAddressRoutingEnterLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress
  }
};

const registrationAddressRoutingConfirmLimitedPartnerUsualResidentialAddress = {
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
  registrationAddressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress,
  registrationAddressRoutingPostcodeLimitedPartnerUsualResidentialAddress,
  registrationAddressRoutingChooseLimitedPartnerUsualResidentialAddress,
  registrationAddressRoutingEnterLimitedPartnerUsualResidentialAddress,
  registrationAddressRoutingConfirmLimitedPartnerUsualResidentialAddress
];

// principal office address - Legal entity

const limitedPartnerPrincipalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const registrationAddressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const registrationAddressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress = {
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

const registrationAddressRoutingChooseLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
  }
};

const registrationAddressRoutingEnterLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress
  }
};

const registrationAddressRoutingConfirmLimitedPartnerPrincipalOfficeAddress = {
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
  registrationAddressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress,
  registrationAddressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress,
  registrationAddressRoutingChooseLimitedPartnerPrincipalOfficeAddress,
  registrationAddressRoutingEnterLimitedPartnerPrincipalOfficeAddress,
  registrationAddressRoutingConfirmLimitedPartnerPrincipalOfficeAddress
];

const limitedPartnerRouting = [...usualResidentialAddress, ...principalOfficeAddress];

export default limitedPartnerRouting;
