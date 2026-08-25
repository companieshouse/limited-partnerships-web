import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { REGISTRATION_WITH_IDS_URL, SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

import { runReviewGeneralPartnersTests } from "../../shared/generalPartner/reviewGeneralPartners";

it("should run review general partners tests for registration journey", () => {
  expect(REVIEW_GENERAL_PARTNERS_URL).toContain("registration");
});

runReviewGeneralPartnersTests({
  url: REVIEW_GENERAL_PARTNERS_URL,
  pageType: {
    reviewGeneralPartners: RegistrationPageType.reviewGeneralPartners
  },
  redirectUrls: {
    generalPartners: GENERAL_PARTNERS_URL,
    addGeneralPartnerPerson: ADD_GENERAL_PARTNER_PERSON_URL,
    addGeneralPartnerLegalEntity: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    limitedPartners: LIMITED_PARTNERS_URL,
    reviewLimitedPartners: REVIEW_LIMITED_PARTNERS_URL
  },
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExclude: ["emptyList"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
