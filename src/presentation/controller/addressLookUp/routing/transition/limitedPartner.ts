import AddressPageType from "../../PageType";
import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "../../../transition/url";
import * as url from "../../url/transition";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// usual residential address - Person

const limitedPartnerUsualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice"
};

const transitionAddressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress = {
  previousUrl: ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const transitionAddressRoutingPostcodeLimitedPartnerUsualResidentialAddress = {
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

const transitionAddressRoutingChooseLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const transitionAddressRoutingEnterLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress
  }
};

const transitionAddressRoutingConfirmLimitedPartnerUsualResidentialAddress = {
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
  transitionAddressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress,
  transitionAddressRoutingPostcodeLimitedPartnerUsualResidentialAddress,
  transitionAddressRoutingChooseLimitedPartnerUsualResidentialAddress,
  transitionAddressRoutingEnterLimitedPartnerUsualResidentialAddress,
  transitionAddressRoutingConfirmLimitedPartnerUsualResidentialAddress
];

const limitedPartnerPrincipalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const transitionAddressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const transitionAddressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress = {
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

const transitionAddressRoutingChooseLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
  }
};

const transitionAddressRoutingEnterLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress
  }
};

const transitionAddressRoutingConfirmLimitedPartnerPrincipalOfficeAddress = {
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
  transitionAddressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress,
  transitionAddressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress,
  transitionAddressRoutingEnterLimitedPartnerPrincipalOfficeAddress,
  transitionAddressRoutingChooseLimitedPartnerPrincipalOfficeAddress,
  transitionAddressRoutingConfirmLimitedPartnerPrincipalOfficeAddress
];

const limitedPartnerRouting = [...usualResidentialAddress, ...principalOfficeAddress];

export default limitedPartnerRouting;
