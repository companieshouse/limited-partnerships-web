import TransitionPageType from "../PageType";
import * as url from "../url";
import {
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../addressLookUp/url/transition";

const transitionRoutingGeneralPartners = {
  previousUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.GENERAL_PARTNERS_URL,
  nextUrl: url.GENERAL_PARTNER_CHOICE_URL,
  pageType: TransitionPageType.generalPartners
};

const transitionRoutingGeneralPartnerChoice = {
  previousUrl: url.GENERAL_PARTNERS_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "",
  pageType: TransitionPageType.generalPartnerChoice
};

const transitionRoutingAddGeneralPartnerPerson = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: TransitionPageType.addGeneralPartnerPerson,
  data: {
    customPreviousUrl: url.REVIEW_GENERAL_PARTNERS_URL
  }
};

const transitionRoutingAddGeneralPartnerLegalEntity = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: TransitionPageType.addGeneralPartnerLegalEntity,
  data: {
    customPreviousUrl: url.REVIEW_GENERAL_PARTNERS_URL
  }
};

// usual residential address

// correspondence address

// principal office address

const transitionRoutingReviewGeneralPartners = {
  previousUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  nextUrl: url.LIMITED_PARTNERS_URL,
  pageType: TransitionPageType.reviewGeneralPartners
};

const transitionRoutingRemoveGeneralPartner = {
  previousUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  currentUrl: url.REMOVE_GENERAL_PARTNER_URL,
  nextUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  pageType: TransitionPageType.removeGeneralPartner
};

const generalPartnerRouting = [
  transitionRoutingGeneralPartners,
  transitionRoutingGeneralPartnerChoice,
  transitionRoutingAddGeneralPartnerPerson,
  transitionRoutingAddGeneralPartnerLegalEntity,
  transitionRoutingReviewGeneralPartners,
  transitionRoutingRemoveGeneralPartner
];

export default generalPartnerRouting;
