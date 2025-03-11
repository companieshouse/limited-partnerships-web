import { PageRouting, PagesRouting } from "../PageRouting";

import RegistrationPageType from "./PageType";
import PageType from "../PageType";
import * as url from "./url";
import {
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
} from "../addressLookUp/url";

const registrationRoutingPartnershipType = {
  previousUrl: url.START_URL,
  currentUrl: url.WHICH_TYPE_URL,
  nextUrl: url.NAME_URL,
  pageType: RegistrationPageType.whichType,
};

const registrationRoutingName = {
  previousUrl: url.WHICH_TYPE_URL,
  currentUrl: url.NAME_URL,
  nextUrl: url.EMAIL_URL,
  pageType: RegistrationPageType.name,
};

const registrationRoutingEmail = {
  previousUrl: url.NAME_WITH_IDS_URL,
  currentUrl: url.EMAIL_URL,
  nextUrl: url.WHERE_IS_THE_JURISDICTION_URL,
  pageType: RegistrationPageType.email,
};

const registrationRoutingJurisdiction = {
  previousUrl: url.EMAIL_URL,
  currentUrl: url.WHERE_IS_THE_JURISDICTION_URL,
  nextUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.whereIsTheJurisdiction,
};

// registered office address

// principal place of business

const registrationRoutingTerm = {
  previousUrl: CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.TERM_URL,
  nextUrl: url.GENERAL_PARTNERS_URL,
  pageType: RegistrationPageType.term,
};

const registrationRoutingGeneralPartners = {
  previousUrl: CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.GENERAL_PARTNERS_URL,
  nextUrl: url.GENERAL_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.generalPartners,
};

const registrationRoutingGeneralPartnerChoice = {
  previousUrl: url.GENERAL_PARTNERS_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "",
  pageType: RegistrationPageType.generalPartnerChoice,
};

const registrationRoutingAddGeneralPartnerPerson = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_PERSON_URL,
  nextUrl: url.GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOICE_URL,
  pageType: RegistrationPageType.addGeneralPartnerPerson,
};

const registrationRoutingGeneralPartnerUsualResidentialAddressChoice = {
  previousUrl: url.ADD_GENERAL_PARTNER_PERSON_URL,
  currentUrl: url.GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOICE_URL,
  nextUrl: url.LIMITED_PARTNERS_URL,
  pageType: RegistrationPageType.generalPartnerUsualResidentialAddressChoice,
};

const registrationRoutingAddGeneralPartnerLegalEntity = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: url.LIMITED_PARTNERS_URL,
  pageType: RegistrationPageType.addGeneralPartnerLegalEntity,
};

const registrationRoutingLimitedPartners = {
  previousUrl: url.GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOICE_URL,
  currentUrl: url.LIMITED_PARTNERS_URL,
  nextUrl: url.LIMITED_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.limitedPartners,
};

export const registrationRoutingLimitedPartnerChoice = {
  previousUrl: url.LIMITED_PARTNERS_URL,
  currentUrl: url.LIMITED_PARTNER_CHOICE_URL,
  nextUrl: url.CHECK_YOUR_ANSWERS_URL,
  pageType: RegistrationPageType.limitedPartnerChoice,
};

export const registrationRoutingCheckYourAnswers = {
  previousUrl: url.LIMITED_PARTNER_CHOICE_URL,
  currentUrl: url.CHECK_YOUR_ANSWERS_URL,
  nextUrl: url.APPLICATION_SUBMITTED_URL,
  pageType: RegistrationPageType.checkYourAnswers,
};

export const registrationRoutingApplicationSubmitted = {
  previousUrl: url.CHECK_YOUR_ANSWERS_URL,
  currentUrl: url.APPLICATION_SUBMITTED_URL,
  nextUrl: url.NEXT_URL,
  pageType: RegistrationPageType.applicationSubmitted,
};

const registrationRoutingNext = {
  previousUrl: url.CHECK_YOUR_ANSWERS_URL,
  currentUrl: url.NEXT_URL,
  nextUrl: "/",
  pageType: RegistrationPageType.next,
};

const list = [
  registrationRoutingPartnershipType,
  registrationRoutingName,
  registrationRoutingEmail,
  registrationRoutingJurisdiction,
  registrationRoutingTerm,
  registrationRoutingGeneralPartners,
  registrationRoutingLimitedPartners,
  registrationRoutingGeneralPartnerChoice,
  registrationRoutingAddGeneralPartnerPerson,
  registrationRoutingGeneralPartnerUsualResidentialAddressChoice,
  registrationRoutingAddGeneralPartnerLegalEntity,
  registrationRoutingLimitedPartnerChoice,
  registrationRoutingCheckYourAnswers,
  registrationRoutingApplicationSubmitted,
  registrationRoutingNext,
];

export const registrationsRouting: PagesRouting = new Map<PageType, PageRouting>();

list.forEach((routing) => {
  registrationsRouting.set(routing.pageType, routing);
});

export default registrationsRouting;
