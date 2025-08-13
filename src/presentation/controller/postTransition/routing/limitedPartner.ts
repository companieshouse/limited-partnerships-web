import * as url from "../url";
import PostTransitionPageType from "../pageType";

const postTransitionRoutingLimitedPartnerChoice = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.LIMITED_PARTNER_CHOICE_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.limitedPartnerChoice
};

const limitedPartnerRouting = [
  postTransitionRoutingLimitedPartnerChoice
];

export default limitedPartnerRouting;
