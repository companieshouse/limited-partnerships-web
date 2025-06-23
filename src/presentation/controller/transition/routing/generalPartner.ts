import TransitionPageType from "../PageType";
import * as url from "../url";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL, TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../addressLookUp/url/transition";

const transitionRoutingGeneralPartners = {
  previousUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.GENERAL_PARTNERS_URL,
  nextUrl: url.GENERAL_PARTNER_CHOICE_URL,
  pageType: TransitionPageType.generalPartners
};

const transitionRoutingGeneralPartnerChoice = {
  previousUrl: url.GENERAL_PARTNERS_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "",
  pageType: TransitionPageType.generalPartnerChoice
};

const transitionRoutingAddGeneralPartnerPerson = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: TransitionPageType.addGeneralPartnerPerson,
  data: {
    // customPreviousUrl: url.REVIEW_GENERAL_PARTNERS_URL // TODO enable custom previous URL when available
  }
};

const generalPartnerRouting = [
  transitionRoutingGeneralPartners,
  transitionRoutingGeneralPartnerChoice,
  transitionRoutingAddGeneralPartnerPerson
];

export default generalPartnerRouting;
