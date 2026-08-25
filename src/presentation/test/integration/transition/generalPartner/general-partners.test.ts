import { SERVICE_NAME_KEY_TRANSITION, TRANSITION_WITH_IDS_URL } from "../../../../../config/constants";

import { GENERAL_PARTNERS_URL, REVIEW_GENERAL_PARTNERS_URL } from "../../../../controller/transition/url";

import TransitionPageType from "../../../../controller/transition/PageType";

import { runGeneralPartnersTests } from "../../shared/generalPartner/generalPartners";

it("should run general partners tests for transition journey", () => {
  expect(GENERAL_PARTNERS_URL).toContain("transition");
});

runGeneralPartnersTests({
  url: GENERAL_PARTNERS_URL,
  pageType: {
    generalPartners: TransitionPageType.generalPartners,
    generalPartnerType: TransitionPageType.generalPartnerType
  },
  redirectUrlReview: REVIEW_GENERAL_PARTNERS_URL,
  baseUrlWithIds: TRANSITION_WITH_IDS_URL,
  translateExclude: ["disqualificationStatement", "disqualificationStatementLegend"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
