import request from "supertest";
import {
  PartnershipType,
  Term
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../config/dev-dependencies";
import {
  GENERAL_PARTNERS_URL,
  TERM_URL
} from "../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import RegistrationPageType from "../../../controller/registration/PageType";
import { ApiErrors } from "../../../../domain/entities/UIErrors";

describe("Email Page", () => {
  const URL = getUrl(TERM_URL);
  const REDIRECT_URL = getUrl(GENERAL_PARTNERS_URL);

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  describe("Get Term Page", () => {
    describe("should load page", () => {
      it("should load the page with English text", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
          limitedPartnership
        ]);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        testTranslations(res.text, enTranslationText.termPage);
        expect(res.text).toContain(
          `${enTranslationText.termPage.title} - ${enTranslationText.service} - GOV.UK`
        );
        expect(res.text).not.toContain("WELSH -");
      });

      it("should load the page with Welsh text", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.SLP)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
          limitedPartnership
        ]);

        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${cyTranslationText.termPage.title} - ${cyTranslationText.service} - GOV.UK`
        );
        testTranslations(res.text, cyTranslationText.termPage);
        expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
      });
    });

    describe("should redirect to general partner page", () => {
      it(`should redirect to general partner page if ${PartnershipType.PFLP}`, async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.PFLP)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
          limitedPartnership
        ]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });

      it(`should redirect to general partner page if ${PartnershipType.SPFLP}`, async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.SPFLP)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
          limitedPartnership
        ]);

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
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
          limitedPartnership
        ]);

        const res = await request(app).post(URL).send({
          pageType: RegistrationPageType.term,
          term: Term.BY_AGREEMENT
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });
    });

    it("should return a validation error", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const apiErrors: ApiErrors = {
        errors: { "data.term": "Term must be valid" }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.email,
        term: "wrong-term"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Term must be valid");
    });
  });
});
