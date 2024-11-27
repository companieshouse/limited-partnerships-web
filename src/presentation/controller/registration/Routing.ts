import { PageRouting, PagesRouting } from "../PageRouting";
import {
  BASE_URL,
  SUBMISSION_ID,
  TRANSACTION_ID,
} from "../../../config/constants";
import { START_URL } from "../global/Routing";
import GlobalPageType from "../global/PageType";
import RegistrationPageType from "./PageType";
import PageType from "../PageType";

export const NAME_TEMPLATE = RegistrationPageType.name;
export const NEXT_TEMPLATE = RegistrationPageType.next;

export const NAME_URL = `${BASE_URL}/${NAME_TEMPLATE}`;

export const NEXT_URL = `${BASE_URL}/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/${NEXT_TEMPLATE}`;

export const registrationRoutingStart = {
  previousUrl: "/",
  currentUrl: START_URL,
  nextUrl: NAME_URL,
  pageType: GlobalPageType.start,
};

export const registrationRoutingName = {
  previousUrl: START_URL,
  currentUrl: NAME_URL,
  nextUrl: NEXT_URL,
  pageType: RegistrationPageType.name,
};

const registrationRoutingNext = {
  previousUrl: NAME_URL,
  currentUrl: NEXT_URL,
  nextUrl: "/",
  pageType: RegistrationPageType.next,
};

const list = [
  registrationRoutingStart,
  registrationRoutingName,
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
