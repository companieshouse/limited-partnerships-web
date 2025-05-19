import { PageRouting, PagesRouting } from "../PageRouting";
import { WHICH_TYPE_URL } from "../registration/url";
import GlobalPageType from "./PageType";
import * as url from "./url";

const globalRoutingStart = {
  previousUrl: "/",
  currentUrl: url.START_URL,
  nextUrl: WHICH_TYPE_URL,
  pageType: GlobalPageType.start
};

const globalRoutingSignOut = {
  previousUrl: "/",
  currentUrl: url.SIGN_OUT_URL,
  nextUrl: "/",
  pageType: GlobalPageType.signOut
};

const globalRoutingPayment = {
  previousUrl: "/",
  currentUrl: url.PAYMENT_URL,
  nextUrl: url.NEXT_URL,
  pageType: GlobalPageType.payment
};

const list = [globalRoutingStart, globalRoutingSignOut, globalRoutingPayment];

export const globalsRouting: PagesRouting = new Map<GlobalPageType, PageRouting>();

list.forEach((routing) => {
  globalsRouting.set(routing.pageType, routing);
});

export default globalsRouting;
