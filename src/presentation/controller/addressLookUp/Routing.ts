import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import {
  ADD_GENERAL_PARTNER_PERSON_URL,
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

const addressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress = {
  previousUrl: ADD_GENERAL_PARTNER_PERSON_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: LIMITED_PARTNERS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress
};

const addressRoutingPostcodeGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.postcodeGeneralPartnerUsualResidentialAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
    confirmAddressUrl: LIMITED_PARTNERS_URL // will be changed to confirm residential address (not ready)
  }
};

const addressRoutingEnterGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: LIMITED_PARTNERS_URL, // will be changed to confirm residential address (not ready)
  pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress
};

const addressRoutingChooseGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: LIMITED_PARTNERS_URL, // TODO Change to 'confirm URA page' when ready
  pageType: AddressPageType.chooseGeneralPartnerUsualResidentialAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress
  }
};

const addressRoutingConfirmGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: LIMITED_PARTNERS_URL, // TODO Change when next page ready
  pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
  data: {
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

export const addressLookUpRouting: PagesRouting = new Map<PageType, PageRouting>();

[
  ...registeredOfficeAddress,
  ...principalPlaceOfBusinessAddress,
  ...usualResidentialAddress
].forEach((routing) => {
  addressLookUpRouting.set(routing.pageType, routing);
});

export default addressLookUpRouting;
