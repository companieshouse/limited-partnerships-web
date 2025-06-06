import * as url from "./url";
import TransitionPageType from "./PageType";
import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

const transitionRoutingCompanyNumber = {
  previousUrl: "/",
  currentUrl: url.COMPANY_NUMBER_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  pageType: TransitionPageType.companyNumber
};

const transitionRoutingConfirmLimitedPartnership = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  nextUrl: "/",
  pageType: TransitionPageType.confirmLimitedPartnership
};

const list = [transitionRoutingCompanyNumber, transitionRoutingConfirmLimitedPartnership];

export const transitionRouting: PagesRouting = new Map<PageType, PageRouting>();

list.forEach((routing) => {
  transitionRouting.set(routing.pageType, routing);
});

export default transitionRouting;
