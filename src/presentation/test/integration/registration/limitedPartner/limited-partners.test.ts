import { LIMITED_PARTNERS_URL, REVIEW_LIMITED_PARTNERS_URL } from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { REGISTRATION_WITH_IDS_URL, SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

import { runLimitedPartnersTests } from "../../shared/limitedPartner/limitedPartners";

it("should run limited partners tests for registration journey", () => {
  expect(LIMITED_PARTNERS_URL).toContain("registration");
});

runLimitedPartnersTests({
  url: LIMITED_PARTNERS_URL,
  pageType: RegistrationPageType.limitedPartnerType,
  redirectUrlReview: REVIEW_LIMITED_PARTNERS_URL,
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
