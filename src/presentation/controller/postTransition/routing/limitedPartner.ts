import * as url from "../url";
import PostTransitionPageType from "../pageType";

import { TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../addressLookUp/url/postTransition";

const postTransitionRoutingLimitedPartnerChoice = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.LIMITED_PARTNER_CHOICE_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.limitedPartnerChoice
};

const postTransitionRoutingAddLimitedPartnerPerson = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: PostTransitionPageType.addLimitedPartnerPerson
};

const limitedPartnerRouting = [postTransitionRoutingLimitedPartnerChoice, postTransitionRoutingAddLimitedPartnerPerson];

export default limitedPartnerRouting;
