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
  pageType: PostTransitionPageType.limitedPartnerType,
  data: {
    serviceName: "addLimitedPartner"
  }
};

const postTransitionRoutingAddLimitedPartnerPerson = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: PostTransitionPageType.addLimitedPartnerPerson,
  data: {
    serviceName: "addLimitedPartner"
  }
};

const postTransitionRoutingAddLimitedPartnerLegalEntity = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: PostTransitionPageType.addLimitedPartnerLegalEntity,
  data: {
    serviceName: "addLimitedPartner"
  }
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
    titleKey: REMOVE_LIMITED_PARTNER_KEY,
    serviceName: "removeLimitedPartnerPerson"
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
    titleKey: REMOVE_LIMITED_PARTNER_KEY,
    serviceName: "removeLimitedPartnerEntity"
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

const postTransitionRoutingUpdateLimitedPartnerPerson = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.UPDATE_LIMITED_PARTNER_PERSON_URL,
  nextUrl: url.UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  pageType: PostTransitionPageType.updateLimitedPartnerPerson,
  data: {
    serviceName: "updateLimitedPartnerPerson"
  }
};

const postTransitionRoutingUpdateUsualResidentialAddressYesNo = {
  previousUrl: url.UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  currentUrl: url.UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.updateLimitedPartnerUsualResidentialAddressYesNo,
  data: {
    nextYesUrl: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    nextNoUrl: url.WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL,
    titleKey: "limitedPartnerUsualResidentialAddress",
    fieldName: "update_usual_residential_address_required",
    trackingLabel: "update-usual-residential-address-yes-no"
  }
};

const LIMITED_PARTNER = "limitedPartner";
const UPDATE_PARTNER_KEY = "updatePartner";
const DATE_CHANGE_LINK = PostTransitionPageType.whenDidLimitedPartnerPersonDetailsChange;
const PERSON_CHANGE_LINK = PostTransitionPageType.updateLimitedPartnerPerson;

const postTransitionRoutingWhenDidLimitedPartnerPersonChange = {
  previousUrl: url.UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  currentUrl: url.WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL,
  nextUrl: url.UPDATE_LIMITED_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidLimitedPartnerPersonDetailsChange,
  data: {
    titleKey: LIMITED_PARTNER
  }
};

const postTransitionRoutingUpdateLimitedPartnerPersonCheckYourAnswers = {
  previousUrl: url.WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL,
  currentUrl: url.UPDATE_LIMITED_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.updateLimitedPartnerPersonCheckYourAnswers,
  data: {
    pageKey: UPDATE_PARTNER_KEY,
    dateChangeLink: DATE_CHANGE_LINK,
    personChangeLink: PERSON_CHANGE_LINK
  }
};

const postTransitionRoutingUpdateLimitedPartnerLegalEntity = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: url.UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  pageType: PostTransitionPageType.updateLimitedPartnerLegalEntity,
  data: {
    serviceName: "updateLimitedPartnerLegalEntity"
  }
};

const postTransitionRoutingWhenDidLimitedPartnerLegalEntityChange = {
  previousUrl: url.UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  currentUrl: url.WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
  nextUrl: url.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidLimitedPartnerLegalEntityDetailsChange,
  data: {
    titleKey: LIMITED_PARTNER
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
  postTransitionRoutingRemoveLimitedPartnerLegalEntityCheckYourAnswers,

  postTransitionRoutingUpdateLimitedPartnerPerson,
  postTransitionRoutingUpdateUsualResidentialAddressYesNo,
  postTransitionRoutingWhenDidLimitedPartnerPersonChange,
  postTransitionRoutingUpdateLimitedPartnerPersonCheckYourAnswers,

  postTransitionRoutingUpdateLimitedPartnerLegalEntity,
  postTransitionRoutingWhenDidLimitedPartnerLegalEntityChange
];

export default limitedPartnerRouting;
