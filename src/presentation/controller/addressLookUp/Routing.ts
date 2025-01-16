import { PageRouting, PagesRouting } from "../PageRouting";

import RegistrationPageType from "./PageType";
import PageType from "../PageType";
import * as url from "./url";
import { EMAIL_URL, GENERAL_PARTNERS_URL } from "../registration/url";

const registrationRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: EMAIL_URL,
  currentUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: RegistrationPageType.postcodeRegisteredOfficeAddress
};

const list = [registrationRoutingPostcodeRegisteredOfficeAddress];

export const registrationsRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
