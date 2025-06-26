import TransitionnPageType from "../PageType";
import * as url from "../url";

const transitionRoutingLimitedPartners = {
  previousUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  currentUrl: url.LIMITED_PARTNERS_URL,
  nextUrl: url.LIMITED_PARTNER_CHOICE_URL,
  pageType: TransitionnPageType.limitedPartners
};

const transitionRoutingLimitedPartnerChoice = {
  previousUrl: url.LIMITED_PARTNERS_URL,
  currentUrl: url.LIMITED_PARTNER_CHOICE_URL,
  nextUrl: "",
  pageType: TransitionnPageType.limitedPartnerChoice
};

const transitionRoutingAddLimitedPartnerPerson = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_PERSON_URL,
  nextUrl: "/", // TODO set to TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  pageType: TransitionnPageType.addLimitedPartnerPerson,
  data: {
    customPreviousUrl: "/" // TODO set to REVIEW_LIMITED_PARTNERS_URL
  }
};

const transitionRoutingAddLimitedPartnerLegalEntity = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: "/", // TODO set to TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  pageType: TransitionnPageType.addLimitedPartnerLegalEntity,
  data: {
    customPreviousUrl: url.REVIEW_LIMITED_PARTNERS_URL
  }
};

const limitedPartnerRouting = [
  transitionRoutingLimitedPartners,
  transitionRoutingLimitedPartnerChoice,
  transitionRoutingAddLimitedPartnerPerson,
  transitionRoutingAddLimitedPartnerLegalEntity
];

export default limitedPartnerRouting;
