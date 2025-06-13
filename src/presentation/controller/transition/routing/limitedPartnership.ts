import * as url from "../url";
import TransitionPageType from "../PageType";

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

const limitedPartnershipRouting = [transitionRoutingCompanyNumber, transitionRoutingConfirmLimitedPartnership];

export default limitedPartnershipRouting;
