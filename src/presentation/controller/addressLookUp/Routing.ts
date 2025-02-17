import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import {
  GENERAL_PARTNERS_URL,
  WHERE_IS_THE_JURISDICTION_URL
} from "../registration/url";
import {
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "./url";

// Registered Office Address

const addressRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: WHERE_IS_THE_JURISDICTION_URL,
  currentUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeRegisteredOfficeAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress,
    confirmAddressUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL
  }
};

const addressRoutingChooseRegisteredOfficeAddress = {
  previousUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseRegisteredOfficeAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingEnterRegisteredOfficeAddress = {
  previousUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterRegisteredOfficeAddress
};

const addressRoutingConfirmRegisteredOfficeAddress = {
  previousUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.confirmRegisteredOfficeAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const registeredOfficeAddress = [
  addressRoutingPostcodeRegisteredOfficeAddress,
  addressRoutingChooseRegisteredOfficeAddress,
  addressRoutingEnterRegisteredOfficeAddress,
  addressRoutingConfirmRegisteredOfficeAddress,
];

// principal place of business
const addressRoutingPostcodePrincipalPlaceOfBusinessAddress = {
  previousUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
  data: {
    enterManualAddressPageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
    confirmAddressUrl: "#"
  }
};

const addressRoutingChoosePrincipalPlaceOfBusinessAddress = {
  previousUrl: POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: AddressPageType.choosePrincipalPlaceOfBusinessAddress
};

const addressRoutingEnterPrincipalPlaceOfBusinessAddress = {
  previousUrl: POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress
};

const principalPlaceOfBusinessAddress = [
  addressRoutingPostcodePrincipalPlaceOfBusinessAddress,
  addressRoutingChoosePrincipalPlaceOfBusinessAddress,
  addressRoutingEnterPrincipalPlaceOfBusinessAddress
];

export const addressLookUpRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

[...registeredOfficeAddress, ...principalPlaceOfBusinessAddress].forEach(
  (routing) => {
    addressLookUpRouting.set(routing.pageType, routing);
  }
);

export default addressLookUpRouting;
