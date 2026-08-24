import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "../../../../controller/transition/url";

import TransitionPageType from "../../../../controller/transition/PageType";

import { SERVICE_NAME_KEY_TRANSITION, TRANSITION_WITH_IDS_URL } from "../../../../../config/constants";

import { runReviewGeneralPartnersTests } from "../../shared/generalPartner/reviewGeneralPartners";

it("should run review general partners tests for transition journey", () => {
  expect(REVIEW_GENERAL_PARTNERS_URL).toContain("transition");
});

runReviewGeneralPartnersTests({
  url: REVIEW_GENERAL_PARTNERS_URL,
  pageType: {
    reviewGeneralPartners: TransitionPageType.reviewGeneralPartners
  },
  redirectUrls: {
    generalPartners: GENERAL_PARTNERS_URL,
    addGeneralPartnerPerson: ADD_GENERAL_PARTNER_PERSON_URL,
    addGeneralPartnerLegalEntity: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    limitedPartners: LIMITED_PARTNERS_URL,
    reviewLimitedPartners: REVIEW_LIMITED_PARTNERS_URL
  },
  baseUrlWithIds: TRANSITION_WITH_IDS_URL,
  translateExclude: ["emptyList"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
