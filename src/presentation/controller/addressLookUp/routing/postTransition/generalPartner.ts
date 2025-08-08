import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL
} from "../../../postTransition/url";
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

const postTransitionAddressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress = {
  previousUrl: ADD_GENERAL_PARTNER_PERSON_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const postTransitionAddressRoutingPostcodeGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.postcodeGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
    confirmAddressUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const postTransitionAddressRoutingEnterGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress
  }
};

const postTransitionAddressRoutingChooseGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress
  }
};

const postTransitionAddressRoutingConfirmGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
    confirmAddressUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
  }
};

const usualResidentialAddress = [
  postTransitionAddressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress,
  postTransitionAddressRoutingPostcodeGeneralPartnerUsualResidentialAddress,
  postTransitionAddressRoutingEnterGeneralPartnerUsualResidentialAddress,
  postTransitionAddressRoutingChooseGeneralPartnerUsualResidentialAddress,
  postTransitionAddressRoutingConfirmGeneralPartnerUsualResidentialAddress
];

// correspondence address - Person

const correspondenceAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "service_address",
  [AddressCacheKeys.territoryCacheKey]: "sa_territory_choice"
};

const postTransitionAddressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress = {
  previousUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
  }
};

const postTransitionAddressRoutingPostcodeGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.postcodeGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    confirmAddressUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const postTransitionAddressRoutingChooseGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const postTransitionAddressRoutingEnterGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress
  }
};

const postTransitionAddressRoutingConfirmGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: "/", // TODO update this to the next page URL when available
  pageType: AddressPageType.confirmGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const correspondenceAddress = [
  postTransitionAddressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress,
  postTransitionAddressRoutingPostcodeGeneralPartnerCorrespondenceAddress,
  postTransitionAddressRoutingChooseGeneralPartnerCorrespondenceAddress,
  postTransitionAddressRoutingEnterGeneralPartnerCorrespondenceAddress,
  postTransitionAddressRoutingConfirmGeneralPartnerCorrespondenceAddress
];

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

const generalPartnerRouting = [...usualResidentialAddress, ...correspondenceAddress, ...principalOfficeAddress];

export default generalPartnerRouting;
