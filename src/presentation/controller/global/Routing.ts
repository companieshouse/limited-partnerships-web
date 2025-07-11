import { PageRouting, PagesRouting } from "../PageRouting";
import GlobalPageType from "./PageType";
import * as url from "./url";

const globalRoutingSignOut = {
  previousUrl: "/",
  currentUrl: url.SIGN_OUT_URL,
  nextUrl: "/",
  pageType: GlobalPageType.signOut
};

const globalRoutingConfirmation = {
  previousUrl: "/",
  currentUrl: url.CONFIRMATION_URL,
  nextUrl: "/",
  pageType: GlobalPageType.confirmation
};

const globalRoutingPaymentFailed = {
  previousUrl: "/",
  currentUrl: url.PAYMENT_FAILED_URL,
  nextUrl: "/",
  pageType: GlobalPageType.paymentFailed
};

const list = [globalRoutingSignOut, globalRoutingConfirmation, globalRoutingPaymentFailed];

export const globalsRouting: PagesRouting = new Map<GlobalPageType, PageRouting>();

list.forEach((routing) => {
  globalsRouting.set(routing.pageType, routing);
});

export default globalsRouting;
