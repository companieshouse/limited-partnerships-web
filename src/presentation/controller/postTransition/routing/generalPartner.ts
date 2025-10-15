import * as url from "../url";
import PostTransitionPageType from "../pageType";

import {
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../addressLookUp/url/postTransition";

const postTransitionRoutingGeneralPartnerChoice = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.generalPartnerChoice
};

const postTransitionRoutingAddGeneralPartnerLegalEntity = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: PostTransitionPageType.addGeneralPartnerLegalEntity
};

const postTransitionRoutingAddGeneralPartnerPerson = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: PostTransitionPageType.addGeneralPartnerPerson
};

const postTransitionRoutingGeneralPartnerCheckYourAnswers = {
  previousUrl: "/",
  currentUrl: url.GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.generalPartnerCheckYourAnswers,
  data: {
    confirmPrincipalOfficeAddres: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    confirmCorrespondenceAddress: CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
  }
};

const REMOVE_GENERAL_PARTNER_KEY = "removeGeneralPartner";

const postTransitionRoutingRemoveGeneralPartnerPerson = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL,
  nextUrl: url.REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidTheGeneralPartnerPersonCease,
  data: {
    titleKey: REMOVE_GENERAL_PARTNER_KEY
  }
};

const postTransitionRoutingRemoveGeneralPartnerPersonCheckYourAnswers = {
  previousUrl: url.WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL,
  currentUrl: url.REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.removeGeneralPartnerPersonCheckYourAnswers,
  data: {
    pageKey: REMOVE_GENERAL_PARTNER_KEY
  }
};

const postTransitionRoutingRemoveGeneralPartnerLegalEntity = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_URL,
  nextUrl: url.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidTheGeneralPartnerLegalEntityCease,
  data: {
    titleKey: REMOVE_GENERAL_PARTNER_KEY
  }
};

const generalPartnerRouting = [
  postTransitionRoutingGeneralPartnerChoice,
  postTransitionRoutingAddGeneralPartnerLegalEntity,
  postTransitionRoutingAddGeneralPartnerPerson,
  postTransitionRoutingGeneralPartnerCheckYourAnswers,

  postTransitionRoutingRemoveGeneralPartnerPerson,
  postTransitionRoutingRemoveGeneralPartnerPersonCheckYourAnswers,

  postTransitionRoutingRemoveGeneralPartnerLegalEntity
];

export default generalPartnerRouting;
