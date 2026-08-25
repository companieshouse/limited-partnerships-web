import { REMOVE_GENERAL_PARTNER_URL, REVIEW_GENERAL_PARTNERS_URL } from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

import { runRemoveGeneralPartnerTests } from "../../shared/generalPartner/removeGeneralPartner";

it("should run remove general partner tests for registration journey", () => {
  expect(REMOVE_GENERAL_PARTNER_URL).toContain("registration");
});

runRemoveGeneralPartnerTests({
  url: REMOVE_GENERAL_PARTNER_URL,
  pageType: {
    removeGeneralPartner: RegistrationPageType.removeGeneralPartner
  },
  redirectUrlReview: REVIEW_GENERAL_PARTNERS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
