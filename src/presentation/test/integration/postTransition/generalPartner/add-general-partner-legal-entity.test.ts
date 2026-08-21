import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
} from "../../../../controller/postTransition/url";

import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/postTransition";

import { runAddGeneralPartnerLegalEntityTests } from "../../shared/generalPartner/addGeneralPartnerLegalEntity";
import { POST_TRANSITION_WITH_ID_URL } from "../../../../../config/constants";

it("should run add general partner legal entity tests for post-transition journey", () => {
  expect(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL).toContain("update");
});

runAddGeneralPartnerLegalEntityTests({
  url: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  urlWithIds: ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  pageType: {
    addGeneralPartnerLegalEntity: PostTransitionPageType.addGeneralPartnerLegalEntity,
    reviewGeneralPartners: "",
    generalPartnerType: PostTransitionPageType.generalPartnerType
  },
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  baseUrlWithIds: POST_TRANSITION_WITH_ID_URL,
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
  serviceTitleTranslationKey: { serviceName: "addGeneralPartner" },
  partnerKind: PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY
});
