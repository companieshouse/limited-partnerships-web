import PostTransitionPageType from "../pageType";
import * as url from "../url";

const postTransitionRoutingCompanyNumber = {
  previousUrl: "/",
  currentUrl: url.COMPANY_NUMBER_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  pageType: PostTransitionPageType.companyNumber
};

const postTransitionRoutingConfirmLimitedPartnership = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  nextUrl: "/", // TODO update with landing page URL when available
  pageType: PostTransitionPageType.confirmLimitedPartnership
};

const limitedPartnershipRouting = [postTransitionRoutingCompanyNumber, postTransitionRoutingConfirmLimitedPartnership];

export default limitedPartnershipRouting;
