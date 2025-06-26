import { TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../addressLookUp/url/transition";
import TransitionPageType from "../PageType";
import * as url from "../url";

const transitionRoutingLimitedPartners = {
  previousUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  currentUrl: url.LIMITED_PARTNERS_URL,
  nextUrl: url.LIMITED_PARTNER_CHOICE_URL,
  pageType: TransitionPageType.limitedPartners
};

const transitionRoutingLimitedPartnerChoice = {
  previousUrl: url.LIMITED_PARTNERS_URL,
  currentUrl: url.LIMITED_PARTNER_CHOICE_URL,
  nextUrl: "",
  pageType: TransitionPageType.limitedPartnerChoice
};

const transitionRoutingAddLimitedPartnerPerson = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: TransitionPageType.addLimitedPartnerPerson,
  data: {
    customPreviousUrl: "/" // TODO set to REVIEW_LIMITED_PARTNERS_URL
  }
};

const limitedPartnerRouting = [
  transitionRoutingLimitedPartners,
  transitionRoutingLimitedPartnerChoice,
  transitionRoutingAddLimitedPartnerPerson
];

export default limitedPartnerRouting;
