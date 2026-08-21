import { REMOVE_GENERAL_PARTNER_URL, REVIEW_GENERAL_PARTNERS_URL } from "../../../../controller/transition/url";

import TransitionPageType from "../../../../controller/transition/PageType";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

import { runRemoveGeneralPartnerTests } from "../../shared/generalPartner/removeGeneralPartner";

it("should run remove general partner tests for transition journey", () => {
  expect(REMOVE_GENERAL_PARTNER_URL).toContain("transition");
});

runRemoveGeneralPartnerTests({
  url: REMOVE_GENERAL_PARTNER_URL,
  pageType: {
    removeGeneralPartner: TransitionPageType.removeGeneralPartner
  },
  redirectUrlReview: REVIEW_GENERAL_PARTNERS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
