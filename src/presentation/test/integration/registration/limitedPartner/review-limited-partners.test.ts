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
  REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL,
  TELL_US_ABOUT_PSC_URL
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControlBuilder";

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
  [PartnershipType.SLP, true, REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL],
  [PartnershipType.SPFLP, true, REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL],
  [PartnershipType.LP, true, CHECK_YOUR_ANSWERS_URL],
  [PartnershipType.PFLP, true, CHECK_YOUR_ANSWERS_URL],
  [PartnershipType.SLP, false, TELL_US_ABOUT_PSC_URL],
  [PartnershipType.SPFLP, false, TELL_US_ABOUT_PSC_URL],
  [PartnershipType.LP, false, CHECK_YOUR_ANSWERS_URL],
  [PartnershipType.PFLP, false, CHECK_YOUR_ANSWERS_URL],

])("should redirect to the appropriate page for partnershipType %s when hasPersonWithSignificantControl is %s (redirectUrl: %s)", async (partnershipType: PartnershipType, hasPersonWithSignificantControl: boolean, redirectUrl: string) => {
  const limitedPartnership = new LimitedPartnershipBuilder()
    .withPartnershipType(partnershipType)
    .withHasPersonWithSignificantControl(hasPersonWithSignificantControl)
    .build();
  appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

  const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
  appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

  const personWithSignificantControl = new PersonWithSignificantControlBuilder().isIndividualPerson().build();
  appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

  const res = await request(app).post(getUrl(config.url)).send({
    pageType: RegistrationPageType.reviewLimitedPartners,
    add_another_partner: "no"
  });

  expect(res.status).toBe(302);
  expect(res.headers.location).toContain(getUrl(redirectUrl));
});
