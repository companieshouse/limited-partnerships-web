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
  nextUrl: url.EMAIL_URL,
  pageType: TransitionPageType.confirmLimitedPartnership
};

const transitionRoutingEmail = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.EMAIL_URL,
  nextUrl: "/",
  pageType: TransitionPageType.email
};

const limitedPartnershipRouting = [transitionRoutingCompanyNumber, transitionRoutingConfirmLimitedPartnership, transitionRoutingEmail];

export default limitedPartnershipRouting;
