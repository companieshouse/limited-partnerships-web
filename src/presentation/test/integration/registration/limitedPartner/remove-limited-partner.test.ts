import { REMOVE_LIMITED_PARTNER_URL, REVIEW_LIMITED_PARTNERS_URL } from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

import { runRemoveLimitedPartnerTests } from "../../shared/limitedPartner/removeLimitedPartner";

it("should run remove limited partner tests for registration journey", () => {
  expect(REMOVE_LIMITED_PARTNER_URL).toContain("registration");
});

runRemoveLimitedPartnerTests({
  url: REMOVE_LIMITED_PARTNER_URL,
  pageType: {
    removeLimitedPartner: RegistrationPageType.removeLimitedPartner
  },
  redirectUrlReview: REVIEW_LIMITED_PARTNERS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
