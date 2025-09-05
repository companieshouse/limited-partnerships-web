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
    updateROA: url.ENTER_REGISTERED_OFFICE_ADDRESS_URL
  }
};

const postTransitionRoutingEnterRegisteredOfficeAddress = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrlWithLimitedPartnershipId: url.ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
  nextUrl: url.WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
  pageType: PostTransitionPageType.enterRegisteredOfficeAddress
};

const postTransitionRoutingRegisteredOfficeAddressChange = {
  previousUrl: url.ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
  currentUrl: url.WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
  nextUrl: url.LANDING_PAGE_URL,
  pageType: PostTransitionPageType.whenDidTheRegisteredOfficeAddressChange
};

const limitedPartnershipRouting = [
  postTransitionRoutingCompanyNumber,
  postTransitionRoutingConfirmLimitedPartnership,
  postTransitionRoutingLandingPage,
  postTransitionRoutingEnterRegisteredOfficeAddress,
  postTransitionRoutingRegisteredOfficeAddressChange
];

export default limitedPartnershipRouting;
