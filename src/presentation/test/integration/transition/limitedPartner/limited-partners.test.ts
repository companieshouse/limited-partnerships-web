import { LIMITED_PARTNERS_URL, REVIEW_LIMITED_PARTNERS_URL } from "../../../../controller/transition/url";

import { SERVICE_NAME_KEY_TRANSITION, TRANSITION_WITH_IDS_URL } from "../../../../../config/constants";

import TransitionPageType from "../../../../controller/transition/PageType";

import { runLimitedPartnersTests } from "../../shared/limitedPartner/limitedPartners";

it("should run limited partners tests for transition journey", () => {
  expect(LIMITED_PARTNERS_URL).toContain("transition");
});

runLimitedPartnersTests({
  url: LIMITED_PARTNERS_URL,
  pageType: TransitionPageType.limitedPartnerType,
  redirectUrlReview: REVIEW_LIMITED_PARTNERS_URL,
  baseUrlWithIds: TRANSITION_WITH_IDS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
