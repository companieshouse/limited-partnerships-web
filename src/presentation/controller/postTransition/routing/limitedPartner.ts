import * as url from "../url";
import PostTransitionPageType from "../pageType";

import { CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL, TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../addressLookUp/url/postTransition";

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

const limitedPartnerRouting = [
  postTransitionRoutingLimitedPartnerChoice,
  postTransitionRoutingAddLimitedPartnerPerson,
  postTransitionRoutingAddLimitedPartnerLegalEntity,
  postTransitionRoutingLimitedPartnerCheckYourAnswers
];

export default limitedPartnerRouting;
