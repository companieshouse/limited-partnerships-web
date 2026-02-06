import * as url from "../url";
import PostTransitionPageType from "../pageType";

import {
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../addressLookUp/url/postTransition";

const postTransitionRoutingGeneralPartnerChoice = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.generalPartnerType,
  data: {
    serviceName: "addGeneralPartner"
  }
};

const postTransitionRoutingAddGeneralPartnerLegalEntity = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: PostTransitionPageType.addGeneralPartnerLegalEntity,
  data: {
    serviceName: "addGeneralPartner"
  }
};

const postTransitionRoutingAddGeneralPartnerPerson = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: PostTransitionPageType.addGeneralPartnerPerson,
  data: {
    serviceName: "addGeneralPartner"
  }
};

const postTransitionRoutingGeneralPartnerCheckYourAnswers = {
  previousUrl: "/",
  currentUrl: url.GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.generalPartnerCheckYourAnswers,
  data: {
    confirmPrincipalOfficeAddress: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
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
    titleKey: REMOVE_GENERAL_PARTNER_KEY,
    serviceName: "removeGeneralPartnerPerson"
  }
};

const postTransitionRoutingRemoveGeneralPartnerPersonCheckYourAnswers = {
  previousUrl: url.WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_WITH_IDS_URL,
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
    titleKey: REMOVE_GENERAL_PARTNER_KEY,
    serviceName: "removeGeneralPartnerEntity"
  }
};

const postTransitionRoutingRemoveGeneralPartnerLegalEntityCheckYourAnswers = {
  previousUrl: url.WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_WITH_IDS_URL,
  currentUrl: url.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.removeGeneralPartnerLegalEntityCheckYourAnswers,
  data: {
    pageKey: REMOVE_GENERAL_PARTNER_KEY
  }
};

const GENERAL_PARTNER = "generalPartner";
const UPDATE_GENERAL_PARTNER_KEY = "updateGeneralPartner";

const postTransitionRoutingUpdateGeneralPartnerPerson = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.UPDATE_GENERAL_PARTNER_PERSON_URL,
  nextUrl: url.UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  pageType: PostTransitionPageType.updateGeneralPartnerPerson,
  data: {
    serviceName: "updateGeneralPartnerPerson"
  }
};

const postTransitionRoutingUpdateUsualResidentialAddressYesNo = {
  previousUrl: url.UPDATE_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  currentUrl: url.UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.updateUsualResidentialAddressYesNo,
  data: {
    nextYesUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    nextNoUrl: url.UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL,
    titleKey: "usualResidentialAddress",
    fieldName: "update_usual_residential_address_required",
    trackingLabel: "update-usual-residential-address-yes-no"
  }
};

const postTransitionRoutingUpdateCorrespondenceAddressYesNo = {
  previousUrl: url.UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  currentUrl: url.UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.updateCorrespondenceAddressYesNo,
  data: {
    nextYesUrl: ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    nextNoUrl: url.WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL,
    titleKey: "correspondenceAddress",
    fieldName: "update_service_address_required",
    trackingLabel: "update-correspondence-address-yes-no"
  }
};

const postTransitionRoutingWhenDidGeneralPartnerPersonChange = {
  previousUrl: url.UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL,
  currentUrl: url.WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL,
  nextUrl: url.UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidGeneralPartnerPersonDetailsChange,
  data: {
    titleKey: GENERAL_PARTNER
  }
};

const postTransitionRoutingChangeGeneralPartnerPersonCheckYourAnswers = {
  previousUrl: url.WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL,
  currentUrl: url.UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.updateGeneralPartnerPersonCheckYourAnswers,
  data: {
    pageKey: UPDATE_GENERAL_PARTNER_KEY
  }
};

const postTransitionRoutingUpdateGeneralPartnerLegalEntity = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: url.UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  pageType: PostTransitionPageType.updateGeneralPartnerLegalEntity,
  data: {
    serviceName: "updateGeneralPartnerLegalEntity"
  }
};

const postTransitionRoutingUpdatePrincipalOfficeAddressYesNo = {
  previousUrl: url.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  currentUrl: url.UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.updatePrincipalOfficeAddressYesNo,
  data: {
    nextYesUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    nextNoUrl: url.WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
    titleKey: "principalOfficeAddress",
    fieldName: "update_principal_office_address_required",
    trackingLabel: "update-principal-office-address-yes-no"
  }
};

const postTransitionRoutingWhenDidGeneralPartnerLegalEntityChange = {
  previousUrl: url.UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  currentUrl: url.WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
  nextUrl: url.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidGeneralPartnerLegalEntityDetailsChange,
  data: {
    titleKey: GENERAL_PARTNER
  }
};

const postTransitionRoutingChangeGeneralPartnerLegalEntityCheckYourAnswers = {
  previousUrl: url.WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
  currentUrl: url.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.updateGeneralPartnerLegalEntityCheckYourAnswers,
  data: {
    pageKey: UPDATE_GENERAL_PARTNER_KEY
  }
};

const generalPartnerRouting = [
  postTransitionRoutingGeneralPartnerChoice,
  postTransitionRoutingAddGeneralPartnerLegalEntity,
  postTransitionRoutingAddGeneralPartnerPerson,
  postTransitionRoutingGeneralPartnerCheckYourAnswers,

  postTransitionRoutingRemoveGeneralPartnerPerson,
  postTransitionRoutingRemoveGeneralPartnerPersonCheckYourAnswers,

  postTransitionRoutingRemoveGeneralPartnerLegalEntity,
  postTransitionRoutingRemoveGeneralPartnerLegalEntityCheckYourAnswers,

  postTransitionRoutingUpdateGeneralPartnerPerson,
  postTransitionRoutingUpdateGeneralPartnerLegalEntity,
  postTransitionRoutingUpdateUsualResidentialAddressYesNo,
  postTransitionRoutingUpdateCorrespondenceAddressYesNo,
  postTransitionRoutingUpdatePrincipalOfficeAddressYesNo,
  postTransitionRoutingWhenDidGeneralPartnerPersonChange,
  postTransitionRoutingWhenDidGeneralPartnerLegalEntityChange,
  postTransitionRoutingChangeGeneralPartnerPersonCheckYourAnswers,
  postTransitionRoutingChangeGeneralPartnerLegalEntityCheckYourAnswers
];

export default generalPartnerRouting;
