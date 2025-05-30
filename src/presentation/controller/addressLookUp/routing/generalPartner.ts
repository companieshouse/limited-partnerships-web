import AddressPageType from "../PageType";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  REVIEW_GENERAL_PARTNERS_URL
} from "../../registration/url";
import * as url from "../url";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// usual residential address - Person

const usualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice"
};

const addressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress = {
  previousUrl: ADD_GENERAL_PARTNER_PERSON_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const addressRoutingPostcodeGeneralPartnerUsualResidentialAddress = {
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

const addressRoutingEnterGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress
  }
};

const addressRoutingChooseGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress
  }
};

const addressRoutingConfirmGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress
  }
};

const usualResidentialAddress = [
  addressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress,
  addressRoutingPostcodeGeneralPartnerUsualResidentialAddress,
  addressRoutingEnterGeneralPartnerUsualResidentialAddress,
  addressRoutingChooseGeneralPartnerUsualResidentialAddress,
  addressRoutingConfirmGeneralPartnerUsualResidentialAddress
];

// correspondence address - Person

const correspondenceAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "service_address",
  [AddressCacheKeys.territoryCacheKey]: "sa_territory_choice"
};

const addressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress = {
  previousUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
  }
};

const addressRoutingPostcodeGeneralPartnerCorrespondenceAddress = {
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

const addressRoutingChooseGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const addressRoutingEnterGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress
  }
};

const addressRoutingConfirmGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: REVIEW_GENERAL_PARTNERS_URL,
  pageType: AddressPageType.confirmGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const correspondenceAddress = [
  addressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress,
  addressRoutingPostcodeGeneralPartnerCorrespondenceAddress,
  addressRoutingChooseGeneralPartnerCorrespondenceAddress,
  addressRoutingEnterGeneralPartnerCorrespondenceAddress,
  addressRoutingConfirmGeneralPartnerCorrespondenceAddress
];

// principal office address - legal entity

const principalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const addressRoutingTerritoryChoiceGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const addressRoutingPostcodeGeneralPartnerPrincipalOfficeAddress = {
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

const addressRoutingChooseGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress
  }
};

const addressRoutingEnterGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress
  }
};

const addressRoutingConfirmGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: REVIEW_GENERAL_PARTNERS_URL,
  pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress
  }
};

const principalOfficeAddress = [
  addressRoutingTerritoryChoiceGeneralPartnerPrincipalOfficeAddress,
  addressRoutingPostcodeGeneralPartnerPrincipalOfficeAddress,
  addressRoutingEnterGeneralPartnerPrincipalOfficeAddress,
  addressRoutingChooseGeneralPartnerPrincipalOfficeAddress,
  addressRoutingConfirmGeneralPartnerPrincipalOfficeAddress
];

const generalPartnerRouting = [...usualResidentialAddress, ...correspondenceAddress, ...principalOfficeAddress];

export default generalPartnerRouting;
