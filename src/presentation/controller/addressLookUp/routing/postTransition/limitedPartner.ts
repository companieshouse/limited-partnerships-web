import { ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL, ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL, LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL, UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL } from "../../../postTransition/url";
import AddressPageType from "../../PageType";
import * as url from "../../url/postTransition";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// usual residential address - Person

const usualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice"
};

const postTransitionAddressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress = {
  previousUrl: ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    previousUrlUpdateLimitedPartnerPerson: UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
  }
};

const postTransitionAddressRoutingPostcodeLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
    confirmAddressUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const postTransitionAddressRoutingEnterLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress
  }
};

const postTransitionAddressRoutingChooseLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const postTransitionAddressRoutingConfirmLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL,
  pageType: AddressPageType.confirmLimitedPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
    previousUrlUpdateLimitedPartnerPerson: UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
  }
};

const usualResidentialAddress = [
  postTransitionAddressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress,
  postTransitionAddressRoutingPostcodeLimitedPartnerUsualResidentialAddress,
  postTransitionAddressRoutingEnterLimitedPartnerUsualResidentialAddress,
  postTransitionAddressRoutingChooseLimitedPartnerUsualResidentialAddress,
  postTransitionAddressRoutingConfirmLimitedPartnerUsualResidentialAddress
];

// principal office address - legal entity

const principalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const postTransitionAddressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const postTransitionAddressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
    confirmAddressUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const postTransitionAddressRoutingChooseLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
  }
};

const postTransitionAddressRoutingEnterLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress
  }
};

const postTransitionAddressRoutingConfirmLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL,
  pageType: AddressPageType.confirmLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
  }
};

const principalOfficeAddress = [
  postTransitionAddressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress,
  postTransitionAddressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress,
  postTransitionAddressRoutingEnterLimitedPartnerPrincipalOfficeAddress,
  postTransitionAddressRoutingChooseLimitedPartnerPrincipalOfficeAddress,
  postTransitionAddressRoutingConfirmLimitedPartnerPrincipalOfficeAddress
];

const limitedPartnerRouting = [...usualResidentialAddress, ...principalOfficeAddress];

export default limitedPartnerRouting;
