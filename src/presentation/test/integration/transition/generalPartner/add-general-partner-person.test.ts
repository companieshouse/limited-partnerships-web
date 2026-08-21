import { ADD_GENERAL_PARTNER_PERSON_URL, ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL } from "../../../../controller/transition/url";

import {
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/transition";

import { TRANSITION_WITH_IDS_URL } from "../../../../../config/constants";

import TransitionPageType from "../../../../controller/transition/PageType";

import { runAddGeneralPartnerPersonTests } from "../../shared/generalPartner/addGeneralPartnerPerson";

it("should run add general partner person tests for transition journey", () => {
  expect(ADD_GENERAL_PARTNER_PERSON_URL).toContain("transition");
});

runAddGeneralPartnerPersonTests({
  url: ADD_GENERAL_PARTNER_PERSON_URL,
  urlWithIds: ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
  pageType: {
    addGeneralPartnerPerson: TransitionPageType.addGeneralPartnerPerson,
    reviewGeneralPartners: TransitionPageType.reviewGeneralPartners,
    generalPartnerType: TransitionPageType.generalPartnerType
  },
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  baseUrlWithIds: TRANSITION_WITH_IDS_URL,
  translateExcludeAddOrUpdatePartnerPersonPage: [
    "errorMessages",
    "limitedPartner",
    "dateEffectiveFrom",
    "dateHint",
    "dateDay",
    "dateMonth",
    "dateYear"
  ],
  translateExcludeGeneralPartnersPage: [
    "title",
    "pageInformation",
    "disqualificationStatement",
    "disqualificationStatementLegend"
  ],
  serviceTitleTranslationKey: "serviceTransition"
});
