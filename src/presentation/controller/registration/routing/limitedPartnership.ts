import RegistrationPageType from "../PageType";
import * as url from "../url";
import {
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "../../addressLookUp/url";

const registrationRoutingPartnershipType = {
  previousUrl: "/",
  currentUrl: url.WHICH_TYPE_URL,
  nextUrl: url.NAME_URL,
  pageType: RegistrationPageType.whichType
};

const registrationRoutingName = {
  previousUrl: url.WHICH_TYPE_URL,
  currentUrl: url.NAME_URL,
  nextUrl: url.EMAIL_URL,
  pageType: RegistrationPageType.name
};

const registrationRoutingEmail = {
  previousUrl: url.NAME_WITH_IDS_URL,
  currentUrl: url.EMAIL_URL,
  nextUrl: url.WHERE_IS_THE_JURISDICTION_URL,
  pageType: RegistrationPageType.email
};

const registrationRoutingJurisdiction = {
  previousUrl: url.EMAIL_URL,
  currentUrl: url.WHERE_IS_THE_JURISDICTION_URL,
  nextUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.whereIsTheJurisdiction
};

// registered office address

// principal place of business

const registrationRoutingTerm = {
  previousUrl: CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.TERM_URL,
  nextUrl: url.SIC_URL,
  pageType: RegistrationPageType.term
};

const registrationRoutingSic = {
  previousUrl: url.TERM_URL,
  currentUrl: url.SIC_URL,
  nextUrl: url.GENERAL_PARTNERS_URL,
  pageType: RegistrationPageType.sic
};

const registrationRoutingCheckYourAnswers = {
  previousUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  currentUrl: url.CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: RegistrationPageType.checkYourAnswers,
  data: {
    reviewGeneralPartnersType: RegistrationPageType.reviewGeneralPartners,
    reviewLimitedPartnersType: RegistrationPageType.reviewLimitedPartners
  }
};

const limitedPartnershipRouting = [
  registrationRoutingPartnershipType,
  registrationRoutingName,
  registrationRoutingEmail,
  registrationRoutingJurisdiction,
  registrationRoutingTerm,
  registrationRoutingSic,

  registrationRoutingCheckYourAnswers
];

export default limitedPartnershipRouting;
