import * as url from "../url";
import PostTransitionPageType from "../pageType";

import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../addressLookUp/url/postTransition";

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

const postTransitionRoutingAddLimitedPartnerLegalEntity = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: PostTransitionPageType.addLimitedPartnerLegalEntity
};

const postTransitionRoutingLimitedPartnerCheckYourAnswers = {
  previousUrl: "/",
  currentUrl: url.LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.limitedPartnerCheckYourAnswers,
  data: {
    confirmUsualResidentialAddress: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    confirmPrincipalOfficeAddress: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const REMOVE_LIMITED_PARTNER_KEY = "removeLimitedPartner";

const postTransitionRoutingRemoveLimitedPartnerPerson = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.WHEN_DID_THE_LIMITED_PARTNER_PERSON_CEASE_URL,
  nextUrl: url.REMOVE_LIMITED_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidTheLimitedPartnerPersonCease,
  data: {
    titleKey: REMOVE_LIMITED_PARTNER_KEY
  }
};

const postTransitionRoutingRemoveLimitedPartnerPersonCheckYourAnswers = {
  previousUrl: url.WHEN_DID_THE_LIMITED_PARTNER_PERSON_CEASE_WITH_IDS_URL,
  currentUrl: url.REMOVE_LIMITED_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.removeLimitedPartnerPersonCheckYourAnswers,
  data: {
    pageKey: REMOVE_LIMITED_PARTNER_KEY
  }
};

const postTransitionRoutingRemoveLimitedPartnerLegalEntity = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.WHEN_DID_THE_LIMITED_PARTNER_LEGAL_ENTITY_CEASE_URL,
  nextUrl: url.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease,
  data: {
    titleKey: REMOVE_LIMITED_PARTNER_KEY
  }
};

const postTransitionRoutingRemoveLimitedPartnerLegalEntityCheckYourAnswers = {
  previousUrl: url.WHEN_DID_THE_LIMITED_PARTNER_LEGAL_ENTITY_CEASE_WITH_IDS_URL,
  currentUrl: url.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.removeLimitedPartnerLegalEntityCheckYourAnswers,
  data: {
    pageKey: REMOVE_LIMITED_PARTNER_KEY
  }
};

const limitedPartnerRouting = [
  postTransitionRoutingLimitedPartnerChoice,
  postTransitionRoutingAddLimitedPartnerPerson,
  postTransitionRoutingAddLimitedPartnerLegalEntity,
  postTransitionRoutingLimitedPartnerCheckYourAnswers,
  postTransitionRoutingRemoveLimitedPartnerPerson,
  postTransitionRoutingRemoveLimitedPartnerPersonCheckYourAnswers,
  postTransitionRoutingRemoveLimitedPartnerLegalEntity,
  postTransitionRoutingRemoveLimitedPartnerLegalEntityCheckYourAnswers
];

export default limitedPartnerRouting;
