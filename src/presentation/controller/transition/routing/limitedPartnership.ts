import * as url from "../url";
import TransitionPageType from "../PageType";
import { POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../../addressLookUp/url/transition";

const transitionRoutingContinueSavedFiling = {
  previousUrl: "/",
  currentUrl: url.CONTINUE_SAVED_FILING_URL,
  nextUrl: url.COMPANY_NUMBER_URL,
  pageType: TransitionPageType.continueSavedFiling
};

const transitionRoutingCompanyNumber = {
  previousUrl: url.CONTINUE_SAVED_FILING_URL,
  currentUrl: url.COMPANY_NUMBER_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  pageType: TransitionPageType.companyNumber
};

const transitionRoutingAlreadyFiled = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.TRANSITION_ALREADY_FILED_URL,
  nextUrl: "/",
  pageType: TransitionPageType.transitionAlreadyFiled
};

const transitionRoutingConfirmLimitedPartnership = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  nextUrl: url.EMAIL_URL,
  pageType: TransitionPageType.confirmLimitedPartnership
};

const transitionRoutingEmail = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.EMAIL_URL,
  nextUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: TransitionPageType.email
};

const transitionRoutingCheckYourAnswers = {
  previousUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  currentUrl: url.CHECK_YOUR_ANSWERS_URL,
  nextUrl: "/",
  pageType: TransitionPageType.checkYourAnswers,
  data: {
    reviewGeneralPartnersType: TransitionPageType.reviewGeneralPartners,
    reviewLimitedPartnersType: TransitionPageType.reviewLimitedPartners
  }
};

const limitedPartnershipRouting = [
  transitionRoutingContinueSavedFiling,
  transitionRoutingCompanyNumber,
  transitionRoutingAlreadyFiled,
  transitionRoutingConfirmLimitedPartnership,
  transitionRoutingEmail,
  transitionRoutingCheckYourAnswers
];

export default limitedPartnershipRouting;
