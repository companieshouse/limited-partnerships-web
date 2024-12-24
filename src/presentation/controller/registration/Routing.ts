import { PageRouting, PagesRouting } from "../PageRouting";
import { BASE_URL, BASE_WITH_IDS_URL } from "../../../config/constants";

import RegistrationPageType from "./PageType";
import PageType from "../PageType";

// Templates
export const WHICH_TYPE_TEMPLATE = RegistrationPageType.whichType;
export const NAME_TEMPLATE = RegistrationPageType.name;
export const EMAIL_TEMPLATE = RegistrationPageType.email;
export const GENERAL_PARTNERS_TEMPLATE = RegistrationPageType.generalPartners;
export const LIMITED_PARTNERS_TEMPLATE = RegistrationPageType.limitedPartners;
export const GENERAL_PARTNER_CHOICE_TEMPLATE =
  RegistrationPageType.generalPartnerChoice;
export const LIMITED_PARTNER_CHOICE_TEMPLATE =
  RegistrationPageType.limitedPartnerChoice;
export const NEXT_TEMPLATE = RegistrationPageType.next;

// URLs
const START_URL = `${BASE_URL}/start`;
export const WHICH_TYPE_URL = `${BASE_URL}/${WHICH_TYPE_TEMPLATE}`;
export const NAME_URL = `${BASE_URL}/${NAME_TEMPLATE}`;
export const NAME_WITH_IDS_URL = `${BASE_WITH_IDS_URL}/${NAME_TEMPLATE}`;
export const EMAIL_URL = `${BASE_WITH_IDS_URL}/${EMAIL_TEMPLATE}`;
export const GENERAL_PARTNERS_URL = `${BASE_WITH_IDS_URL}/${GENERAL_PARTNERS_TEMPLATE}`;
export const GENERAL_PARTNER_CHOICE_URL = `${BASE_WITH_IDS_URL}/${GENERAL_PARTNER_CHOICE_TEMPLATE}`;

export const LIMITED_PARTNERS_URL = `${BASE_WITH_IDS_URL}/${LIMITED_PARTNERS_TEMPLATE}`;
export const LIMITED_PARTNER_CHOICE_URL = `${BASE_WITH_IDS_URL}/${LIMITED_PARTNER_CHOICE_TEMPLATE}`;
export const NEXT_URL = `${BASE_WITH_IDS_URL}/${NEXT_TEMPLATE}`;

const registrationRoutingPartnershipType = {
  previousUrl: START_URL,
  currentUrl: WHICH_TYPE_URL,
  nextUrl: NAME_URL,
  pageType: RegistrationPageType.whichType,
};

const registrationRoutingName = {
  previousUrl: WHICH_TYPE_URL,
  currentUrl: NAME_URL,
  nextUrl: EMAIL_URL,
  pageType: RegistrationPageType.name,
};

const registrationRoutingEmail = {
  previousUrl: NAME_WITH_IDS_URL,
  currentUrl: EMAIL_URL,
  nextUrl: GENERAL_PARTNERS_URL,
  pageType: RegistrationPageType.email,
};

const registrationRoutingGeneralPartners = {
  previousUrl: EMAIL_URL,
  currentUrl: GENERAL_PARTNERS_URL,
  nextUrl: GENERAL_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.generalPartners,
};

const registrationRoutingGeneralPartnerChoice = {
  previousUrl: GENERAL_PARTNERS_URL,
  currentUrl: GENERAL_PARTNER_CHOICE_URL,
  nextUrl: LIMITED_PARTNERS_URL,
  pageType: RegistrationPageType.generalPartnerChoice,
};

const registrationRoutingLimitedPartners = {
  previousUrl: GENERAL_PARTNER_CHOICE_URL,
  currentUrl: LIMITED_PARTNERS_URL,
  nextUrl: LIMITED_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.limitedPartners,
};

export const registrationRoutingLimitedPartnerChoice = {
  previousUrl: LIMITED_PARTNERS_URL,
  currentUrl: LIMITED_PARTNER_CHOICE_URL,
  nextUrl: NEXT_URL,
  pageType: RegistrationPageType.limitedPartnerChoice,
};

const registrationRoutingNext = {
  previousUrl: LIMITED_PARTNER_CHOICE_URL,
  currentUrl: NEXT_URL,
  nextUrl: "/",
  pageType: RegistrationPageType.next,
};

const list = [
  registrationRoutingPartnershipType,
  registrationRoutingName,
  registrationRoutingEmail,
  registrationRoutingGeneralPartners,
  registrationRoutingLimitedPartners,
  registrationRoutingGeneralPartnerChoice,
  registrationRoutingLimitedPartnerChoice,
  registrationRoutingNext,
];

export const registrationsRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
