import RegistrationPageType from "../PageType";
import * as url from "../url";

const registrationRoutingPsc = {
  previousUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  currentUrl: url.PSC_URL,
  nextUrl: url.WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL,
  pageType: RegistrationPageType.psc
};

const pscRouting = [
  registrationRoutingPsc
];

export default pscRouting;
