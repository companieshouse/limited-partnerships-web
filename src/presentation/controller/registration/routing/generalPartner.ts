import RegistrationPageType from "../PageType";
import * as url from "../url";
import {
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../addressLookUp/url";

const registrationRoutingGeneralPartners = {
  previousUrl: CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.GENERAL_PARTNERS_URL,
  nextUrl: url.GENERAL_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.generalPartners
};

const registrationRoutingGeneralPartnerChoice = {
  previousUrl: url.GENERAL_PARTNERS_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "",
  pageType: RegistrationPageType.generalPartnerChoice
};

const registrationRoutingAddGeneralPartnerPerson = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: RegistrationPageType.addGeneralPartnerPerson,
  data: {
    customPreviousUrl: url.REVIEW_GENERAL_PARTNERS_URL
  }
};

const registrationRoutingAddGeneralPartnerLegalEntity = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.addGeneralPartnerLegalEntity,
  data: {
    customPreviousUrl: url.REVIEW_GENERAL_PARTNERS_URL
  }
};

// usual residential address

// correspondence address

// principal office address

const registrationRoutingReviewGeneralPartners = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  nextUrl: url.LIMITED_PARTNERS_URL,
  pageType: RegistrationPageType.reviewGeneralPartners
};

const registrationRoutingRemoveGeneralPartner = {
  previousUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  currentUrl: url.REMOVE_GENERAL_PARTNER_URL,
  nextUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  pageType: RegistrationPageType.removeGeneralPartner
};

const generalPartnerRouting = [
  registrationRoutingGeneralPartners,
  registrationRoutingGeneralPartnerChoice,
  registrationRoutingAddGeneralPartnerPerson,
  registrationRoutingAddGeneralPartnerLegalEntity,
  registrationRoutingReviewGeneralPartners,
  registrationRoutingRemoveGeneralPartner
];

export default generalPartnerRouting;
