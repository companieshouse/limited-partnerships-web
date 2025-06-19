import * as url from "../url";
import TransitionPageType from "../PageType";
import { POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../../addressLookUp/url/transition";

const transitionRoutingCompanyNumber = {
  previousUrl: "/",
  currentUrl: url.COMPANY_NUMBER_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  pageType: TransitionPageType.companyNumber
};

const transitionRoutingConfirmLimitedPartnership = {
  previousUrl: url.COMPANY_NUMBER_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNERSHIP_URL,
  nextUrl: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: TransitionPageType.confirmLimitedPartnership
};

const limitedPartnershipRouting = [transitionRoutingCompanyNumber, transitionRoutingConfirmLimitedPartnership];

export default limitedPartnershipRouting;
