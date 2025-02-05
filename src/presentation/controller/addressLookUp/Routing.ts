import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import { GENERAL_PARTNERS_URL, WHAT_IS_YOUR_JURISDICTION_URL } from "../registration/url";
import {
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_PRINCIPLE_PLACE_OF_BUSINESS_URL
} from "./url";

// Registered Office Address

const addressRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: WHAT_IS_YOUR_JURISDICTION_URL,
  currentUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeRegisteredOfficeAddress,
  data: {
    enterRegisteredOfficeAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingChooseRegisteredOfficeAddress = {
  previousUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseRegisteredOfficeAddress,
  data: {
    enterRegisteredOfficeAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingEnterRegisteredOfficeAddress = {
  previousUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterRegisteredOfficeAddress,
};

const addressRoutingConfirmRegisteredOfficeAddress = {
  previousUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: POSTCODE_PRINCIPLE_PLACE_OF_BUSINESS_URL,
  pageType: AddressPageType.confirmRegisteredOfficeAddress,
  data: {
    enterRegisteredOfficeAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingPostcodePrinciplePlaceOfBusiness = {
  previousUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: POSTCODE_PRINCIPLE_PLACE_OF_BUSINESS_URL,
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: AddressPageType.postcodePrinciplePlaceOfBusiness
};

const registeredOfficeAddress = [
  addressRoutingPostcodeRegisteredOfficeAddress,
  addressRoutingChooseRegisteredOfficeAddress,
  addressRoutingEnterRegisteredOfficeAddress,
  addressRoutingConfirmRegisteredOfficeAddress,
  addressRoutingPostcodePrinciplePlaceOfBusiness
];

export const addressLookUpRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

registeredOfficeAddress.forEach((routing) => {
  addressLookUpRouting.set(routing.pageType, routing);
});

export default addressLookUpRouting;
