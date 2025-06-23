import AddressPageType from "../../PageType";
import * as url from "../../url/transition";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// usual residential address - Person

const usualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice"
};

const transitionAddressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress = {
  previousUrl: "",
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const transitionAddressRoutingPostcodeGeneralPartnerUsualResidentialAddress = {
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

const transitionAddressRoutingEnterGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress
  }
};

const transitionAddressRoutingChooseGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress
  }
};

const transitionAddressRoutingConfirmGeneralPartnerUsualResidentialAddress = {
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
  transitionAddressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress,
  transitionAddressRoutingPostcodeGeneralPartnerUsualResidentialAddress,
  transitionAddressRoutingEnterGeneralPartnerUsualResidentialAddress,
  transitionAddressRoutingChooseGeneralPartnerUsualResidentialAddress,
  transitionAddressRoutingConfirmGeneralPartnerUsualResidentialAddress
];

// correspondence address - Person

const correspondenceAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "service_address",
  [AddressCacheKeys.territoryCacheKey]: "sa_territory_choice"
};

const registrationAddressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress = {
  previousUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
  }
};

const registrationAddressRoutingPostcodeGeneralPartnerCorrespondenceAddress = {
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

const registrationAddressRoutingChooseGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const registrationAddressRoutingEnterGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress
  }
};

const registrationAddressRoutingConfirmGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: "/", // TODO nextUrl set to review page once ready
  pageType: AddressPageType.confirmGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const correspondenceAddress = [
  registrationAddressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress,
  registrationAddressRoutingPostcodeGeneralPartnerCorrespondenceAddress,
  registrationAddressRoutingChooseGeneralPartnerCorrespondenceAddress,
  registrationAddressRoutingEnterGeneralPartnerCorrespondenceAddress,
  registrationAddressRoutingConfirmGeneralPartnerCorrespondenceAddress
];

const generalPartnerRouting = [...usualResidentialAddress, ...correspondenceAddress];

export default generalPartnerRouting;
