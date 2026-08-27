import { REMOVE_LIMITED_PARTNER_URL, REVIEW_LIMITED_PARTNERS_URL } from "../../../../controller/transition/url";

import TransitionPageType from "../../../../controller/transition/PageType";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

import { runRemoveLimitedPartnerTests } from "../../shared/limitedPartner/removeLimitedPartner";

it("should run remove limited partner tests for transition journey", () => {
  expect(REMOVE_LIMITED_PARTNER_URL).toContain("transition");
});

runRemoveLimitedPartnerTests({
  url: REMOVE_LIMITED_PARTNER_URL,
  pageType: {
    removeLimitedPartner: TransitionPageType.removeLimitedPartner
  },
  redirectUrlReview: REVIEW_LIMITED_PARTNERS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
