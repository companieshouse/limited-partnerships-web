import request from "supertest";
import { Jurisdiction, PartnershipType, Term } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import {
  LANDING_PAGE_URL,
  TERM_URL,
  TERM_WITH_IDS_URL,
  WHEN_DID_THE_TERM_CHANGE_URL
} from "../../../../controller/postTransition/url";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

describe("Email Page", () => {
  const URL = getUrl(TERM_URL);
  const REDIRECT_URL = getUrl(WHEN_DID_THE_TERM_CHANGE_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  describe("Get Term Page", () => {
    describe("should load page", () => {
      it("should load the page with English text", async () => {
        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        testTranslations(res.text, enTranslationText.termPage);
        expect(res.text).toContain(
          `${enTranslationText.termPage.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
        );
        expect(res.text).not.toContain("WELSH -");
      });

      it("should load the page with Welsh text", async () => {
        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${cyTranslationText.termPage.title} - ${cyTranslationText.servicePostTransition} - GOV.UK`
        );
        testTranslations(res.text, cyTranslationText.termPage);
        expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
      });

      it("should load the page with ids", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .withPartnershipName(companyProfile.data.companyName)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const URL = getUrl(TERM_WITH_IDS_URL);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        testTranslations(res.text, enTranslationText.termPage);
        expect(res.text).toContain(
          `${enTranslationText.termPage.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
        );
        expect(res.text).not.toContain("WELSH -");
      });
    });

    describe("should redirect to landing page", () => {
      it(`should redirect to landing page if ${PartnershipType.PFLP}`, async () => {
        const REDIRECT_URL = getUrl(LANDING_PAGE_URL);

        companyProfile.data.subtype = "private-fund-limited-partnership";

        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });

      it(`should redirect to landing page if ${PartnershipType.SPFLP}`, async () => {
        const REDIRECT_URL = getUrl(LANDING_PAGE_URL);

        companyProfile.data.jurisdiction = Jurisdiction.SCOTLAND;
        companyProfile.data.subtype = "private-fund-limited-partnership";

        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });
    });

    describe("Post term", () => {
      it("should send term", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .withPartnershipName(companyProfile.data.companyName)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).post(URL).send({
          pageType: PostTransitionPageType.term,
          term: Term.BY_AGREEMENT
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });

      it("should update term", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .withPartnershipName(companyProfile.data.companyName)
          .withTerm(Term.BY_AGREEMENT)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const URL = getUrl(TERM_WITH_IDS_URL);

        const res = await request(app).post(URL).send({
          pageType: PostTransitionPageType.term,
          term: Term.UNTIL_DISSOLUTION
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });

      it("should return a validation error", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipName(companyProfile.data.companyName)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const apiErrors: ApiErrors = {
          errors: { "data.term": "Term must be valid" }
        };

        appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

        const res = await request(app).post(URL).send({
          pageType: PostTransitionPageType.term,
          term: "wrong-term"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain("Term must be valid");
      });
    });
  });
});
