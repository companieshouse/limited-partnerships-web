import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import {
  GENERAL_PARTNERS_URL,
  WHAT_IS_YOUR_JURISDICTION_URL
} from "../registration/url";
import {
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "./url";

// Registered Office Address

const addressRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: WHAT_IS_YOUR_JURISDICTION_URL,
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
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: AddressPageType.confirmRegisteredOfficeAddress
};

const registeredOfficeAddress = [
  addressRoutingPostcodeRegisteredOfficeAddress,
  addressRoutingChooseRegisteredOfficeAddress,
  addressRoutingEnterRegisteredOfficeAddress,
  addressRoutingConfirmRegisteredOfficeAddress
];

// principal place of business
const addressRoutingPostcodePrincipalPlaceOfBusinessAddress = {
  previousUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
  data: {
    enterManualAddressPageType: "#",
    confirmAddressUrl: "#"
  }
};

const principalPlaceOfBusinessAddress = [
  addressRoutingPostcodePrincipalPlaceOfBusinessAddress
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
