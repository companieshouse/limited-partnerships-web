import PostTransitionPageType from "../pageType";
import * as url from "../url";

const postTransitionRoutingGeneralPartnerChoice = {
  previousUrl: "/",
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "",
  pageType: PostTransitionPageType.generalPartnerChoice
};

const generalPartnerRouting = [
  postTransitionRoutingGeneralPartnerChoice
];

export default generalPartnerRouting;
