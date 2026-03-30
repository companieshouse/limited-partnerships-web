import RegistrationPageType from "../PageType";
import * as url from "../url";

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

const registrationRoutingAddRelevantLegalEntity = {
  previousUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  currentUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  nextUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_URL,
  pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity
};

const personWithSignificantControlRouting = [
  registrationRoutingPersonWithSignificantControl,
  registrationRoutingWillLimitedPartnershipHavePsc,
  registrationRoutingAddRelevantLegalEntity
];

export default personWithSignificantControlRouting;
