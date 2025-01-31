import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import * as url from "./url";
import { WHAT_IS_YOUR_JURISDICTION_URL, GENERAL_PARTNERS_URL } from "../registration/url";

// Registered Office Address

const addressRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: WHAT_IS_YOUR_JURISDICTION_URL,
  currentUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeRegisteredOfficeAddress,
  data: {
    enterRegisteredOfficeAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingChooseRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: AddressPageType.chooseRegisteredOfficeAddress,
  data: {
    enterRegisteredOfficeAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingEnterRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: AddressPageType.enterRegisteredOfficeAddress,
};

const registeredOfficeAddress = [
  addressRoutingPostcodeRegisteredOfficeAddress,
  addressRoutingChooseRegisteredOfficeAddress,
  addressRoutingEnterRegisteredOfficeAddress
];

export const addressLookUpRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

registeredOfficeAddress.forEach((routing) => {
  addressLookUpRouting.set(routing.pageType, routing);
});

export default addressLookUpRouting;
