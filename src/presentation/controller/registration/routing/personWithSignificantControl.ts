import RegistrationPageType from "../PageType";
import * as url from "../url";
import { TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../addressLookUp/url/registration";

const registrationRoutingPersonWithSignificantControl = {
  previousUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  currentUrl: url.TELL_US_ABOUT_PSC_URL,
  nextUrl: url.WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL,
  pageType: RegistrationPageType.tellUsAboutPscPage
};

const registrationRoutingWillLimitedPartnershipHavePsc = {
  previousUrl: url.TELL_US_ABOUT_PSC_URL,
  currentUrl: url.WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL,
  nextUrl: "",
  pageType: RegistrationPageType.willLimitedPartnershipHavePsc
};

const registrationRoutingPersonWithSignificantControlChoice = {
  previousUrl: url.WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL,
  currentUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  nextUrl: "",
  pageType: RegistrationPageType.personWithSignificantControlChoice
};

// RELEVANT LEGAL ENTITY

const registrationRoutingAddRelevantLegalEntity = {
  previousUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  currentUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  nextUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity
};

const registrationRoutingRelevantLegalEntityWhichTypeOfNatureOfControl = {
  previousUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL,
  currentUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.whichTypeOfNatureOfControlRelevantLegalEntity
};

// OTHER REGISTRABLE PERSON

const registrationRoutingAddOtherRegistrablePerson = {
  previousUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  currentUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  nextUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  pageType: RegistrationPageType.addPersonWithSignificantControlOtherRegistrablePerson
};

const registrationRoutingOtherRegistrablePersonWhichTypeOfNatureOfControl = {
  previousUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_WITH_IDS_URL,
  currentUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.whichTypeOfNatureOfControlOtherRegistrablePerson
};

const personWithSignificantControlRouting = [
  registrationRoutingPersonWithSignificantControl,
  registrationRoutingWillLimitedPartnershipHavePsc,
  registrationRoutingPersonWithSignificantControlChoice,
  registrationRoutingAddRelevantLegalEntity,
  registrationRoutingAddOtherRegistrablePerson,
  registrationRoutingRelevantLegalEntityWhichTypeOfNatureOfControl,
  registrationRoutingOtherRegistrablePersonWhichTypeOfNatureOfControl
];

export default personWithSignificantControlRouting;
