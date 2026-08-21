import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL
} from "../../../../controller/postTransition/url";

import {
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../presentation/controller/addressLookUp/url/postTransition";

import { POST_TRANSITION_WITH_ID_URL } from "../../../../../config/constants";

import { runAddGeneralPartnerPersonTests } from "../../shared/generalPartner/addGeneralPartnerPerson";

it("should run add general partner person tests for post-transition journey", () => {
  expect(ADD_GENERAL_PARTNER_PERSON_URL).toContain("update");
});

runAddGeneralPartnerPersonTests({
  url: ADD_GENERAL_PARTNER_PERSON_URL,
  urlWithIds: ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  pageType: {
    addGeneralPartnerPerson: PostTransitionPageType.addGeneralPartnerPerson,
    reviewGeneralPartners: "",
    generalPartnerType: PostTransitionPageType.generalPartnerType
  },
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  baseUrlWithIds: POST_TRANSITION_WITH_ID_URL,
  translateExcludeAddOrUpdatePartnerPersonPage: ["limitedPartner", "errorMessages"],
  translateExcludeGeneralPartnersPage: [
    "title",
    "pageInformation",
    "disqualificationStatement",
    "disqualificationStatementLegend"
  ],
  serviceTitleTranslationKey: { serviceName: "addGeneralPartner" },
  partnerKind: PartnerKind.ADD_GENERAL_PARTNER_PERSON
});
