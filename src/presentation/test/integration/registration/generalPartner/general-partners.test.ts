import { GENERAL_PARTNERS_URL, REVIEW_GENERAL_PARTNERS_URL } from "../../../../controller/registration/url";

import { REGISTRATION_WITH_IDS_URL, SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { runGeneralPartnersTests } from "../../shared/generalPartner/generalPartners";

it("should run general partners tests for registration journey", () => {
  expect(GENERAL_PARTNERS_URL).toContain("registration");
});

runGeneralPartnersTests({
  url: GENERAL_PARTNERS_URL,
  pageType: {
    generalPartners: RegistrationPageType.generalPartners,
    generalPartnerType: RegistrationPageType.generalPartnerType
  },
  redirectUrlReview: REVIEW_GENERAL_PARTNERS_URL,
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExclude: ["disqualificationStatement", "disqualificationStatementLegend"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
