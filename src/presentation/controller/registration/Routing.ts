import { PageRouting, PagesRouting } from "../PageRouting";
import {
  BASE_URL,
  START_URL,
  SUBMISSION_ID,
  TRANSACTION_ID,
} from "../../../config/constants";
import PageRegistrationType from "./PageType";

export const NAME_TEMPLATE = PageRegistrationType.name;
export const NEXT_TEMPLATE = PageRegistrationType.next;

export const NAME_URL = `${BASE_URL}/${NAME_TEMPLATE}`;

export const NEXT_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT_TEMPLATE}`;

export const registrationRoutingStart = {
  previousUrl: "/",
  currentUrl: START_URL,
  nextUrl: NAME_URL,
  pageType: PageRegistrationType.start,
};

export const registrationRoutingName = {
  previousUrl: START_URL,
  currentUrl: NAME_URL,
  nextUrl: NEXT_URL,
  pageType: PageRegistrationType.name,
};

const registrationRoutingNext = {
  previousUrl: NAME_URL,
  currentUrl: NEXT_URL,
  nextUrl: "/",
  pageType: PageRegistrationType.next,
};

const list = [
  registrationRoutingStart,
  registrationRoutingName,
  registrationRoutingNext,
];

export const registrationsRouting: PagesRouting = new Map<
  PageRegistrationType,
  PageRouting
>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
