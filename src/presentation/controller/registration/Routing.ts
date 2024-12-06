import { PageRouting, PagesRouting } from "../PageRouting";
import {
  BASE_URL,
  BASE_WITH_IDS_URL,
} from "../../../config/constants";

import RegistrationPageType from "./PageType";
import PageType from "../PageType";

const START_URL = `${BASE_URL}/start`;
export const WHICH_TYPE_TEMPLATE = RegistrationPageType.whichType;
export const NAME_TEMPLATE = RegistrationPageType.name;
export const GENERAL_PARTNERS_TEMPLATE = RegistrationPageType.generalPartners;
export const NEXT_TEMPLATE = RegistrationPageType.next;

export const WHICH_TYPE_URL = `${BASE_URL}/${WHICH_TYPE_TEMPLATE}`;
export const NAME_URL = `${BASE_URL}/${NAME_TEMPLATE}`;

export const GENERAL_PARTNERS_URL = `${BASE_WITH_IDS_URL}/${GENERAL_PARTNERS_TEMPLATE}`;

export const NEXT_URL = `${BASE_WITH_IDS_URL}/${NEXT_TEMPLATE}`;

const registrationRoutingPartnershipType = {
  previousUrl: START_URL,
  currentUrl: WHICH_TYPE_URL,
  nextUrl: NAME_URL,
  pageType: RegistrationPageType.whichType,
};

export const registrationRoutingName = {
  previousUrl: WHICH_TYPE_URL,
  currentUrl: NAME_URL,
  nextUrl: NEXT_URL,
  pageType: RegistrationPageType.name,
};

const registrationRoutingGeneralPartners = {
  previousUrl: WHICH_TYPE_URL,
  currentUrl: GENERAL_PARTNERS_URL,
  nextUrl: NEXT_URL,
  pageType: RegistrationPageType.generalPartners,
};

const registrationRoutingNext = {
  previousUrl: WHICH_TYPE_URL,
  currentUrl: NEXT_URL,
  nextUrl: "/",
  pageType: RegistrationPageType.next,
};

const list = [
  registrationRoutingPartnershipType,
  registrationRoutingName,
  registrationRoutingGeneralPartners,
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
