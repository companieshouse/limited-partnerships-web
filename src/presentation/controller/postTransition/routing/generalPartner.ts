import PostTransitionPageType from "../pageType";
import * as url from "../url";

const transitionRoutingGeneralPartnerChoice = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.generalPartnerChoice
};

const transitionRoutingAddGeneralPartnerLegalEntity = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: "/", // TODO - replace with the next URL when available
  pageType: PostTransitionPageType.addGeneralPartnerLegalEntity
};

const generalPartnerRouting = [transitionRoutingGeneralPartnerChoice, transitionRoutingAddGeneralPartnerLegalEntity];

export default generalPartnerRouting;
