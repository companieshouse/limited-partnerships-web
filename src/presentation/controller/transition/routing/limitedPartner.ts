import {
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../addressLookUp/url/transition";
import TransitionPageType from "../PageType";
import * as url from "../url";
import { REVIEW_LIMITED_PARTNERS_URL } from "../url";

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
  pageType: TransitionPageType.limitedPartnerType
};

const transitionRoutingAddLimitedPartnerPerson = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: TransitionPageType.addLimitedPartnerPerson,
  data: {
    customPreviousUrl: REVIEW_LIMITED_PARTNERS_URL
  }
};

const transitionRoutingAddLimitedPartnerLegalEntity = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: TransitionPageType.addLimitedPartnerLegalEntity,
  data: {
    customPreviousUrl: url.REVIEW_LIMITED_PARTNERS_URL
  }
};

const transitionRoutingReviewLimitedPartners = {
  previousUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  currentUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  nextUrl: url.CHECK_YOUR_ANSWERS_URL,
  pageType: TransitionPageType.reviewLimitedPartners
};

const transitionRoutingRemoveLimitedPartner = {
  previousUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  currentUrl: url.REMOVE_LIMITED_PARTNER_URL,
  nextUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  pageType: TransitionPageType.removeLimitedPartner
};

const limitedPartnerRouting = [
  transitionRoutingLimitedPartners,
  transitionRoutingLimitedPartnerChoice,
  transitionRoutingAddLimitedPartnerPerson,
  transitionRoutingAddLimitedPartnerLegalEntity,
  transitionRoutingReviewLimitedPartners,
  transitionRoutingRemoveLimitedPartner
];

export default limitedPartnerRouting;
