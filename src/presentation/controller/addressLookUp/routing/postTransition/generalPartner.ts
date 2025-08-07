import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL } from "../../../postTransition/url";
import AddressPageType from "../../PageType";
import * as url from "../../url/postTransition";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// principal office address - legal entity

const principalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const postTransitionAddressRoutingTerritoryChoiceGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const postTransitionAddressRoutingPostcodeGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
    confirmAddressUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const postTransitionAddressRoutingChooseGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress
  }
};

const postTransitionAddressRoutingEnterGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress
  }
};

const postTransitionAddressRoutingConfirmGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: "/", // TODO update this to the next page URL when available
  pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress
  }
};

const principalOfficeAddress = [
  postTransitionAddressRoutingTerritoryChoiceGeneralPartnerPrincipalOfficeAddress,
  postTransitionAddressRoutingPostcodeGeneralPartnerPrincipalOfficeAddress,
  postTransitionAddressRoutingEnterGeneralPartnerPrincipalOfficeAddress,
  postTransitionAddressRoutingChooseGeneralPartnerPrincipalOfficeAddress,
  postTransitionAddressRoutingConfirmGeneralPartnerPrincipalOfficeAddress
];

const generalPartnerRouting = [...principalOfficeAddress];

export default generalPartnerRouting;
