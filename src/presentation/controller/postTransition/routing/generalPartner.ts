import * as url from "../url";
import PostTransitionPageType from "../pageType";

import { TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../addressLookUp/url/postTransition";

const postTransitionRoutingGeneralPartnerChoice = {
  previousUrl: url.LANDING_PAGE_URL,
  currentUrl: url.GENERAL_PARTNER_CHOICE_URL,
  nextUrl: "/",
  pageType: PostTransitionPageType.generalPartnerChoice
};

const postTransitionRoutingAddGeneralPartnerLegalEntity = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: PostTransitionPageType.addGeneralPartnerLegalEntity
};

const postTransitionRoutingAddGeneralPartnerPerson = {
  previousUrl: url.GENERAL_PARTNER_CHOICE_URL,
  currentUrl: url.ADD_GENERAL_PARTNER_PERSON_URL,
  nextUrl: "/", // TODO - replace with the next URL when available,
  pageType: PostTransitionPageType.addGeneralPartnerPerson
};

const generalPartnerRouting = [
  postTransitionRoutingGeneralPartnerChoice,
  postTransitionRoutingAddGeneralPartnerLegalEntity,
  postTransitionRoutingAddGeneralPartnerPerson
];

export default generalPartnerRouting;
