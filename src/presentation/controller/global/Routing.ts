import { PageRouting, PagesRouting } from "../PageRouting";
import GlobalPageType from "./PageType";
import { BASE_URL } from "../../../config/constants";

export const HEALTHCHECK_URL = `${BASE_URL}/healthcheck`;
export const START_TEMPLATE = GlobalPageType.start;

const WHICH_TYPE_URL = `${BASE_URL}/which-type`;
export const START_URL = `${BASE_URL}/${START_TEMPLATE}`;

export const globalRoutingStart = {
  previousUrl: "/",
  currentUrl: START_URL,
  nextUrl: WHICH_TYPE_URL,
  pageType: GlobalPageType.start,
};

const list = [globalRoutingStart];

export const globalsRouting: PagesRouting = new Map<
  GlobalPageType,
  PageRouting
>();

list.forEach((routing) => {
  globalsRouting.set(routing.pageType, routing);
});

export default globalsRouting;
