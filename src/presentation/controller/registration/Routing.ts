import { PageRouting, PagesRouting } from "../PageRouting";

import RegistrationPageType from "./PageType";
import PageType from "../PageType";
import * as url from "./url";
import { CHOOSE_REGISTERED_OFFICE_ADDRESS_URL, POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../addressLookUp/url";

const registrationRoutingPartnershipType = {
  previousUrl: url.START_URL,
  currentUrl: url.WHICH_TYPE_URL,
  nextUrl: url.NAME_URL,
  pageType: RegistrationPageType.whichType
};

const registrationRoutingName = {
  previousUrl: url.WHICH_TYPE_URL,
  currentUrl: url.NAME_URL,
  nextUrl: url.EMAIL_URL,
  pageType: RegistrationPageType.name
};

const registrationRoutingEmail = {
  previousUrl: url.NAME_WITH_IDS_URL,
  currentUrl: url.EMAIL_URL,
  nextUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.email
};

// address look-up

const registrationRoutingGeneralPartners = {
  previousUrl: CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.GENERAL_PARTNERS_URL,
  nextUrl: url.GENERAL_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.generalPartners
};

const registrationRoutingGeneralPartnerChoice = {
  previousUrl: url.GENERAL_PARTNERS_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: url.LIMITED_PARTNERS_URL,
  pageType: RegistrationPageType.generalPartnerChoice
};

const registrationRoutingLimitedPartners = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.LIMITED_PARTNERS_URL,
  nextUrl: url.LIMITED_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.limitedPartners
};

export const registrationRoutingLimitedPartnerChoice = {
  previousUrl: url.LIMITED_PARTNERS_URL,
  currentUrl: url.LIMITED_PARTNER_CHOICE_URL,
  nextUrl: url.CHECK_YOUR_ANSWERS_URL,
  pageType: RegistrationPageType.limitedPartnerChoice
};

export const registrationRoutingCheckYourAnswers = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.CHECK_YOUR_ANSWERS_URL,
  nextUrl: url.NEXT_URL,
  pageType: RegistrationPageType.checkYourAnswers,
};

const registrationRoutingNext = {
  previousUrl: url.CHECK_YOUR_ANSWERS_URL,
  currentUrl: url.NEXT_URL,
  nextUrl: "/",
  pageType: RegistrationPageType.next
};

const list = [
  registrationRoutingPartnershipType,
  registrationRoutingName,
  registrationRoutingEmail,
  registrationRoutingGeneralPartners,
  registrationRoutingLimitedPartners,
  registrationRoutingGeneralPartnerChoice,
  registrationRoutingLimitedPartnerChoice,
  registrationRoutingCheckYourAnswers,
  registrationRoutingNext
];

export const registrationsRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
