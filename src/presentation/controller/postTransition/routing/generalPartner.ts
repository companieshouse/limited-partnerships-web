import PostTransitionPageType from "../pageType";
import * as url from "../url";

const postTransitionRoutingGeneralPartnerChoice = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.generalPartnerChoice
};

const postTransitionRoutingAddGeneralPartnerLegalEntity = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: "/", // TODO - replace with the next URL when available
  pageType: PostTransitionPageType.addGeneralPartnerLegalEntity
};

const generalPartnerRouting = [
  postTransitionRoutingGeneralPartnerChoice,
  postTransitionRoutingAddGeneralPartnerLegalEntity
];

export default generalPartnerRouting;
