import { PageRouting, PagesRouting } from "../PageRouting";
import {
  BASE_URL,
  SUBMISSION_ID,
  TRANSACTION_ID,
} from "../../../config/constants";

import RegistrationPageType from "./PageType";
import PageType from "../PageType";

const START_URL = `${BASE_URL}/start`;
export const WHICH_TYPE_TEMPLATE = RegistrationPageType.whichType;
export const NAME_TEMPLATE = RegistrationPageType.name;
export const NEXT_TEMPLATE = RegistrationPageType.next;
export const GENERAL_PARTNERS_TEMPLATE = RegistrationPageType.generalPartners;

export const WHICH_TYPE_URL = `${BASE_URL}/${WHICH_TYPE_TEMPLATE}`;
export const NAME_URL = `${BASE_URL}/${NAME_TEMPLATE}`;

export const NEXT_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT_TEMPLATE}`;

export const GENERAL_PARTNERS_URL = `${BASE_URL}/${GENERAL_PARTNERS_TEMPLATE}`;

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

const registrationRoutingNext = {
  previousUrl: WHICH_TYPE_URL,
  currentUrl: NEXT_URL,
  nextUrl: "/",
  pageType: RegistrationPageType.next,
};

const registrationRoutingGeneralPartners = {
  previousUrl: WHICH_TYPE_URL,
  currentUrl: GENERAL_PARTNERS_URL,
  nextUrl: NEXT_URL,
  pageType: RegistrationPageType.generalPartners,
};

const list = [
  registrationRoutingPartnershipType,
  registrationRoutingName,
  registrationRoutingNext,
  registrationRoutingGeneralPartners,
];

export const registrationsRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
