import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl } from "../../../utils";

import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  CHECK_YOUR_ANSWERS_URL,
  GENERAL_PARTNERS_URL,
  LIMITED_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL,
  TELL_US_ABOUT_PSC_URL
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";

import { REGISTRATION_WITH_IDS_URL, SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

import { runReviewLimitedPartnersTests } from "../../shared/limitedPartner/reviewLimitedPartner";

it("should run review limited partners tests for registration journey", () => {
  expect(REVIEW_LIMITED_PARTNERS_URL).toContain("registration");
});

const config = {
  url: REVIEW_LIMITED_PARTNERS_URL,
  pageType: {
    reviewLimitedPartners: RegistrationPageType.reviewLimitedPartners
  },
  redirectUrls: {
    limitedPartners: LIMITED_PARTNERS_URL,
    generalPartners: GENERAL_PARTNERS_URL,
    addLimitedPartnerPerson: ADD_LIMITED_PARTNER_PERSON_URL,
    addLimitedPartnerLegalEntity: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    reviewLimitedPartners: REVIEW_LIMITED_PARTNERS_URL,
    checkYourAnswers: CHECK_YOUR_ANSWERS_URL
  },
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExclude: ["emptyList", "errorMessage"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
};

runReviewLimitedPartnersTests(config);

it.each([
  [PartnershipType.LP, getUrl(CHECK_YOUR_ANSWERS_URL)],
  [PartnershipType.PFLP, getUrl(CHECK_YOUR_ANSWERS_URL)],
  [PartnershipType.SLP, getUrl(TELL_US_ABOUT_PSC_URL)],
  [PartnershipType.SPFLP, getUrl(TELL_US_ABOUT_PSC_URL)]
])(
  "should redirect to the appropriate page based on partnership type",
  async (partnershipType: PartnershipType, REDIRECT_URL: string) => {
    const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).post(getUrl(config.url)).send({
      pageType: RegistrationPageType.reviewLimitedPartners,
      add_another_partner: "no"
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain(REDIRECT_URL);
  }
);
