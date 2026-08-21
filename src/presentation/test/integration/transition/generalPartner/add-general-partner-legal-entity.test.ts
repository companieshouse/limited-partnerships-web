import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/transition/url";

import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/transition";

import { TRANSITION_WITH_IDS_URL } from "../../../../../config/constants";

import TransitionPageType from "../../../../controller/transition/PageType";

import { runAddGeneralPartnerLegalEntityTests } from "../../shared/generalPartner/addGeneralPartnerLegalEntity";

it("should run add general partner legal entity tests for transition journey", () => {
  expect(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL).toContain("transition");
});

runAddGeneralPartnerLegalEntityTests({
  url: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  urlWithIds: ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  pageType: {
    addGeneralPartnerLegalEntity: TransitionPageType.addGeneralPartnerLegalEntity,
    reviewGeneralPartners: TransitionPageType.reviewGeneralPartners,
    generalPartnerType: TransitionPageType.generalPartnerType
  },
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  baseUrlWithIds: TRANSITION_WITH_IDS_URL,
  translateExcludeAddOrUpdatePartnerLegalEntityPage: [
    "updateTitle",
    "limitedPartner",
    "errorMessages",
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
