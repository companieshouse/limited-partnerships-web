import * as url from "./url";
import TransitionPageType from "./PageType";
import { START_URL, NEXT_URL } from "../registration/url";
import { PageRouting, PagesRouting } from "../PageRouting";
import PageType from "../PageType";

const transitionRoutingCompanyNumber = {
  previousUrl: START_URL,
  currentUrl: url.COMPANY_NUMBER_URL,
  nextUrl: NEXT_URL,
  pageType: TransitionPageType.companyNumber
};

const list = [transitionRoutingCompanyNumber];

export const transitionRouting: PagesRouting = new Map<PageType, PageRouting>();

list.forEach((routing) => {
  transitionRouting.set(routing.pageType, routing);
});

export default transitionRouting;
