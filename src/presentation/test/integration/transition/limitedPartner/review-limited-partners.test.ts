import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  CHECK_YOUR_ANSWERS_URL,
  GENERAL_PARTNERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "../../../../controller/transition/url";

import TransitionPageType from "../../../../controller/transition/PageType";

import { SERVICE_NAME_KEY_TRANSITION, TRANSITION_WITH_IDS_URL } from "../../../../../config/constants";

import { runReviewLimitedPartnersTests } from "../../shared/limitedPartner/reviewLimitedPartner";

it("should run review limited partners tests for transition journey", () => {
  expect(REVIEW_LIMITED_PARTNERS_URL).toContain("transition");
});

runReviewLimitedPartnersTests({
  url: REVIEW_LIMITED_PARTNERS_URL,
  pageType: {
    reviewLimitedPartners: TransitionPageType.reviewLimitedPartners
  },
  redirectUrls: {
    limitedPartners: LIMITED_PARTNERS_URL,
    generalPartners: GENERAL_PARTNERS_URL,
    addLimitedPartnerPerson: ADD_LIMITED_PARTNER_PERSON_URL,
    addLimitedPartnerLegalEntity: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    reviewLimitedPartners: REVIEW_LIMITED_PARTNERS_URL,
    checkYourAnswers: CHECK_YOUR_ANSWERS_URL
  },
  baseUrlWithIds: TRANSITION_WITH_IDS_URL,
  translateExclude: ["emptyList", "errorMessage"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
