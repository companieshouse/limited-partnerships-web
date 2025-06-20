import RegistrationPageType from "../PageType";
import * as url from "../url";
import {
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../addressLookUp/url/registration";

const registrationRoutingLimitedPartners = {
  previousUrl: url.REVIEW_GENERAL_PARTNERS_URL,
  currentUrl: url.LIMITED_PARTNERS_URL,
  nextUrl: url.LIMITED_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.limitedPartners
};

const registrationRoutingLimitedPartnerChoice = {
  previousUrl: url.LIMITED_PARTNERS_URL,
  currentUrl: url.LIMITED_PARTNER_CHOICE_URL,
  nextUrl: "",
  pageType: RegistrationPageType.limitedPartnerChoice
};

const registrationRoutingAddLimitedPartnerPerson = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: RegistrationPageType.addLimitedPartnerPerson,
  data: {
    customPreviousUrl: url.REVIEW_LIMITED_PARTNERS_URL
  }
};

const registrationRoutingAddLimitedPartnerLegalEntity = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.addLimitedPartnerLegalEntity,
  data: {
    customPreviousUrl: url.REVIEW_LIMITED_PARTNERS_URL
  }
};

// usual residential address

const registrationRoutingReviewLimitedPartners = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  nextUrl: url.CHECK_YOUR_ANSWERS_URL,
  pageType: RegistrationPageType.reviewLimitedPartners
};

const registrationRoutingRemoveLimitedPartner = {
  previousUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  currentUrl: url.REMOVE_LIMITED_PARTNER_URL,
  nextUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  pageType: RegistrationPageType.removeLimitedPartner
};

const limitedPartnerRouting = [
  registrationRoutingLimitedPartners,
  registrationRoutingLimitedPartnerChoice,
  registrationRoutingAddLimitedPartnerPerson,
  registrationRoutingAddLimitedPartnerLegalEntity,
  registrationRoutingReviewLimitedPartners,
  registrationRoutingRemoveLimitedPartner
];

export default limitedPartnerRouting;
