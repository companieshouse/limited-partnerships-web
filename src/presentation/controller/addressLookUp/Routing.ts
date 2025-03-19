import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import {
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNER_CHOICE_URL,
  LIMITED_PARTNERS_URL,
  TERM_URL,
  WHERE_IS_THE_JURISDICTION_URL
} from "../registration/url";
import * as url from "./url";

// Registered Office Address

const addressRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: WHERE_IS_THE_JURISDICTION_URL,
  currentUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeRegisteredOfficeAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress,
    confirmAddressUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL
  }
};

const addressRoutingChooseRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseRegisteredOfficeAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingEnterRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterRegisteredOfficeAddress
};

const addressRoutingConfirmRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.confirmRegisteredOfficeAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const registeredOfficeAddress = [
  addressRoutingPostcodeRegisteredOfficeAddress,
  addressRoutingChooseRegisteredOfficeAddress,
  addressRoutingEnterRegisteredOfficeAddress,
  addressRoutingConfirmRegisteredOfficeAddress
];

// principal place of business

const addressRoutingPostcodePrincipalPlaceOfBusinessAddress = {
  previousUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: url.CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
    confirmAddressUrl: url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
  }
};

const addressRoutingChoosePrincipalPlaceOfBusinessAddress = {
  previousUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.choosePrincipalPlaceOfBusinessAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress
  }
};

const addressRoutingEnterPrincipalPlaceOfBusinessAddress = {
  previousUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress
};

const addressRoutingConfirmPrincipalPlaceOfBusinessAddress = {
  previousUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: TERM_URL,
  pageType: AddressPageType.confirmPrincipalPlaceOfBusinessAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress
  }
};

const principalPlaceOfBusinessAddress = [
  addressRoutingPostcodePrincipalPlaceOfBusinessAddress,
  addressRoutingChoosePrincipalPlaceOfBusinessAddress,
  addressRoutingEnterPrincipalPlaceOfBusinessAddress,
  addressRoutingConfirmPrincipalPlaceOfBusinessAddress
];

// GENERAL PARTNER

// usual residential address

const addressRoutingGeneralPartnerUsualResidentialAddressTerritoryChoice = {
  previousUrl: ADD_GENERAL_PARTNER_PERSON_URL,
  currentUrl: url.GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOOSE_TERRITORY_URL,
  nextUrl: LIMITED_PARTNERS_URL,
  pageType: AddressPageType.generalPartnerUsualResidentialAddressTerritoryChoice,
  data: {
    ukAddressConfirmUrl: url.POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL,
    overseasAddressConfirmUrl: url.ENTER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const addressRoutingPostcodeUsualResidentialAddress = {
  previousUrl: GENERAL_PARTNER_CHOICE_URL, // will be changed to Where is the usual residential address (not ready)
  currentUrl: url.POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.postcodeUsualResidentialAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterUsualResidentialAddress,
    confirmAddressUrl: LIMITED_PARTNERS_URL // will be changed to confirm residential address (not ready)
  }
};

const addressRoutingEnterUsualResidentialAddress = {
  previousUrl: url.POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: LIMITED_PARTNERS_URL, // will be changed to confirm residential address (not ready)
  pageType: AddressPageType.enterUsualResidentialAddress,
  data: {
    confirmAddressUrl: LIMITED_PARTNERS_URL
  }
};

const addressRoutingChooseGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: LIMITED_PARTNERS_URL, // TODO Change to 'confirm URA page' when ready
  pageType: AddressPageType.chooseGeneralPartnerUsualResidentialAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const usualResidentialAddress = [
  addressRoutingGeneralPartnerUsualResidentialAddressTerritoryChoice,
  addressRoutingPostcodeUsualResidentialAddress,
  addressRoutingEnterUsualResidentialAddress,
  addressRoutingChooseGeneralPartnerUsualResidentialAddress
];

export const addressLookUpRouting: PagesRouting = new Map<PageType, PageRouting>();

[
  ...registeredOfficeAddress,
  ...principalPlaceOfBusinessAddress,
  ...usualResidentialAddress
].forEach((routing) => {
  addressLookUpRouting.set(routing.pageType, routing);
});

export default addressLookUpRouting;
