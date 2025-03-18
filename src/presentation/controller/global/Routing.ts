import { PageRouting, PagesRouting } from "../PageRouting";
import GlobalPageType from "./PageType";
import { BASE_URL } from "../../../config/constants";

export const HEALTHCHECK_URL = `${BASE_URL}/healthcheck`;
export const START_TEMPLATE = GlobalPageType.start;
export const SIGN_OUT_TEMPLATE = GlobalPageType.signOut;

const WHICH_TYPE_URL = `${BASE_URL}/which-type`;
export const START_URL = `${BASE_URL}/${START_TEMPLATE}`;
export const SIGN_OUT_URL = `${BASE_URL}/${SIGN_OUT_TEMPLATE}`;

export const globalRoutingStart = {
  previousUrl: "/",
  currentUrl: START_URL,
  nextUrl: WHICH_TYPE_URL,
  pageType: GlobalPageType.start,
};

export const globalRoutingSignOut = {
  previousUrl: "/",
  currentUrl: SIGN_OUT_URL,
  nextUrl: "/",
  pageType: GlobalPageType.signOut,
};

const list = [globalRoutingStart, globalRoutingSignOut];

export const globalsRouting: PagesRouting = new Map<
  GlobalPageType,
  PageRouting
>();

list.forEach((routing) => {
  globalsRouting.set(routing.pageType, routing);
});

export default globalsRouting;
