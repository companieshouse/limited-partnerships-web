import { PageRouting, PagesRouting } from "../PageRouting";
import {
  BASE_URL,
  BASE_WITH_IDS_URL,
  SUBMISSION_ID,
  TRANSACTION_ID,
} from "../../../config/constants";

import RegistrationPageType from "./PageType";
import PageType from "../PageType";

const START_URL = `${BASE_URL}/start`;
export const WHICH_TYPE_TEMPLATE = RegistrationPageType.whichType;
export const NAME_TEMPLATE = RegistrationPageType.name;
export const NEXT_TEMPLATE = RegistrationPageType.next;
export const LIMITED_PARTNERS_TEMPLATE = RegistrationPageType.limitedPartners;

export const WHICH_TYPE_URL = `${BASE_URL}/${WHICH_TYPE_TEMPLATE}`;
export const NAME_URL = `${BASE_URL}/${NAME_TEMPLATE}`;

export const NEXT_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT_TEMPLATE}`;

export const LIMITED_PARTNERS_URL = `${BASE_WITH_IDS_URL}/${LIMITED_PARTNERS_TEMPLATE}`;

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

const registrationRoutingLimitedPartners = {
  previousUrl: WHICH_TYPE_URL,
  currentUrl: LIMITED_PARTNERS_URL,
  nextUrl: NEXT_URL,
  pageType: RegistrationPageType.limitedPartners,
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
  registrationRoutingNext,
  registrationRoutingLimitedPartners,
];

export const registrationsRouting: PagesRouting = new Map<
  PageType,
  PageRouting
>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
