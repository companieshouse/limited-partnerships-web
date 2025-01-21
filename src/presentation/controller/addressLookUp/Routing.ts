import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import * as url from "./url";
import { EMAIL_URL, GENERAL_PARTNERS_URL } from "../registration/url";

// Registered Office Address

const addressRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: EMAIL_URL,
  currentUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: AddressPageType.postcodeRegisteredOfficeAddress
};

const registeredOfficeAddress = [addressRoutingPostcodeRegisteredOfficeAddress];

export const addressLookUpRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

registeredOfficeAddress.forEach((routing) => {
  addressLookUpRouting.set(routing.pageType, routing);
});

export default addressLookUpRouting;
