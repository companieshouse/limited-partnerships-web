import PostTransitionPageType from "../pageType";
import * as url from "../url";

const postTransitionRoutingCompanyNumber = {
  previousUrl: "/",
  currentUrl: url.COMPANY_NUMBER_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  pageType: PostTransitionPageType.companyNumber
};

const postTransitionRoutingConfirmLimitedPartnership = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  nextUrl: url.LANDING_PAGE_URL,
  pageType: PostTransitionPageType.confirmLimitedPartnership
};

const postTransitionRoutingLandingPage = {
  previousUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  currentUrl: url.LANDING_PAGE_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.landingPage,
  data: {
    addGeneralPartner: url.GENERAL_PARTNER_CHOICE_URL,
    addLimitedPartner: url.LIMITED_PARTNER_CHOICE_URL,
    updateROA: url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
    updatePPOB: url.ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    updateName: url.PARTNERSHIP_NAME_URL,
    updateTerm: url.TERM_URL
  }
};

const postTransitionRoutingEnterRegisteredOfficeAddress = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
  pageType: PostTransitionPageType.enterRegisteredOfficeAddress
};

const REGISTERED_OFFICE_ADDRESS_KEY = "registeredOfficeAddress";

const postTransitionRoutingRegisteredOfficeAddressChange = {
  previousUrl: url.ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
  currentUrl: url.WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
  nextUrl: url.REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidTheRegisteredOfficeAddressChange,
  data: {
    titleKey: REGISTERED_OFFICE_ADDRESS_KEY
  }
};

const postTransitionRoutingRegisteredOfficeAddressChangeCheckYourAnswers = {
  previousUrl: url.WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
  currentUrl: url.REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.registeredOfficeAddressChangeCheckYourAnswers,
  data: {
    pageKey: REGISTERED_OFFICE_ADDRESS_KEY
  }
};

const PARTNERSHIP_NAME_KEY = "partnershipName";

const postTransitionRoutingPartnershipName = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.PARTNERSHIP_NAME_URL,
  nextUrl: url.WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL,
  pageType: PostTransitionPageType.partnershipName
};

const postTransitionRoutingPartnershipNameChange = {
  previousUrl: url.PARTNERSHIP_NAME_WITH_IDS_URL,
  currentUrl: url.WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL,
  nextUrl: url.PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidThePartnershipNameChange,
  data: {
    titleKey: PARTNERSHIP_NAME_KEY
  }
};

const postTransitionRoutingPartnershipNameChangeCheckYourAnswers = {
  previousUrl: url.WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL,
  currentUrl: url.PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.partnershipNameChangeCheckYourAnswers,
  data: {
    pageKey: PARTNERSHIP_NAME_KEY
  }
};

const postTransitionRoutingTerm = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.TERM_URL,
  nextUrl: url.WHEN_DID_THE_TERM_CHANGE_URL,
  pageType: PostTransitionPageType.term
};

const TERM_KEY = "term";

const postTransitionRoutingTermChange = {
  previousUrl: url.TERM_WITH_IDS_URL,
  currentUrl: url.WHEN_DID_THE_TERM_CHANGE_URL,
  nextUrl: url.TERM_CHANGE_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidTheTermChange,
  data: {
    titleKey: TERM_KEY
  }
};

const postTransitionRoutingTermChangeCheckYourAnswers = {
  previousUrl: url.WHEN_DID_THE_TERM_CHANGE_URL,
  currentUrl: url.TERM_CHANGE_CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.termChangeCheckYourAnswers,
  data: {
    pageKey: TERM_KEY
  }
};

const postTransitionRoutingPrincipalPlaceOfBusinessAddress = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: url.WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL,
  pageType: PostTransitionPageType.enterPrincipalPlaceOfBusinessAddress
};

const PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_KEY = "principalPlaceOfBusinessAddress";

const postTransitionRoutingPrincipalPlaceOfBusinessAddressChange = {
  previousUrl: url.ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL,
  nextUrl: url.PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
  pageType: PostTransitionPageType.whenDidThePrincipalPlaceOfBusinessAddressChange,
  data: {
    titleKey: PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_KEY
  }
};

const limitedPartnershipRouting = [
  postTransitionRoutingCompanyNumber,
  postTransitionRoutingConfirmLimitedPartnership,
  postTransitionRoutingLandingPage,

  postTransitionRoutingEnterRegisteredOfficeAddress,
  postTransitionRoutingRegisteredOfficeAddressChange,
  postTransitionRoutingRegisteredOfficeAddressChangeCheckYourAnswers,

  postTransitionRoutingPartnershipName,
  postTransitionRoutingPartnershipNameChange,
  postTransitionRoutingPartnershipNameChangeCheckYourAnswers,

  postTransitionRoutingTerm,
  postTransitionRoutingTermChange,
  postTransitionRoutingTermChangeCheckYourAnswers,

  postTransitionRoutingPrincipalPlaceOfBusinessAddress,
  postTransitionRoutingPrincipalPlaceOfBusinessAddressChange
];

export default limitedPartnershipRouting;
