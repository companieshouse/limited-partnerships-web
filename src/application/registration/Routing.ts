import { PageRouting, PagesRouting } from "../../domain/entities/PageRouting";
import {
  BASE_URL,
  START_URL,
  SUBMISSION_ID,
  TRANSACTION_ID,
} from "../../config/constants";
import PageRegistrationType from "./PageRegistrationType";

export const NAME_TEMPLATE = PageRegistrationType.name;
export const NEXT_TEMPLATE = PageRegistrationType.next;
// Only for demo - to be removed
export const NEXT2_TEMPLATE = PageRegistrationType["next-2"];

export const NAME_URL = `${BASE_URL}/${NAME_TEMPLATE}`;

export const NEXT_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT_TEMPLATE}`;
// Only for demo - to be removed
export const NEXT2_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT2_TEMPLATE}`;

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

// Only for demo - to be removed
const registrationRoutingNext2 = {
  previousUrl: NAME_URL,
  currentUrl: NEXT2_URL,
  nextUrl: "/",
  pageType: PageRegistrationType["next-2"],
};

const list = [
  registrationRoutingStart,
  registrationRoutingName,
  registrationRoutingNext,
  registrationRoutingNext2,
];

export const registrationsRouting: PagesRouting = new Map<
  PageRegistrationType,
  PageRouting
>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
