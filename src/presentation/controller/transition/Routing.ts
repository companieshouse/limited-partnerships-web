import * as url from "./url";
import TransitionPageType from "./PageType";
import { START_URL } from "../registration/url";
import { NEXT_URL } from "./url";
import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

const transitionRoutingCompanyNumber = {
  previousUrl: START_URL,
  currentUrl: url.COMPANY_NUMBER_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  pageType: TransitionPageType.companyNumber
};

const transitionRoutingConfirmLimitedPartnership = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  nextUrl: NEXT_URL,
  pageType: TransitionPageType.confirmLimitedPartnership
};

const transitionRoutingNext = {
  previousUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  currentUrl: NEXT_URL,
  nextUrl: "/",
  pageType: TransitionPageType.next
};

const list = [transitionRoutingCompanyNumber, transitionRoutingConfirmLimitedPartnership, transitionRoutingNext];

export const transitionRouting: PagesRouting = new Map<PageType, PageRouting>();

list.forEach((routing) => {
  transitionRouting.set(routing.pageType, routing);
});

export default transitionRouting;
