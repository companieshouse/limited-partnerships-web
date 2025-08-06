import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { GENERAL_PARTNERS_URL, REVIEW_GENERAL_PARTNERS_URL, SIC_URL } from "../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import RegistrationPageType from "../../../controller/registration/PageType";
import { ApiErrors } from "../../../../domain/entities/UIErrors";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";

describe("Sic Codes", () => {
  const URL = getUrl(SIC_URL);
  const REDIRECT_URL = getUrl(GENERAL_PARTNERS_URL);

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get Sic Codes Page", () => {
    describe("should load page", () => {
      it("should load the page with English text", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        testTranslations(res.text, enTranslationText.sicCodePage);
        expect(res.text).toContain(`${enTranslationText.sicCodePage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`);
        expect(res.text).not.toContain("WELSH -");
      });

      it("should load the page with Welsh text", async () => {
        setLocalesEnabled(true);

        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.SLP)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        expect(res.text).toContain(`${cyTranslationText.sicCodePage.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`);
        testTranslations(res.text, cyTranslationText.sicCodePage);
        expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
      });

      it("should load the page with data", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .withSicCodes(["12345", "56789", "91011", "12131"])
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        expect(res.text).toContain("12345");
        expect(res.text).toContain("56789");
        expect(res.text).toContain("91011");
        expect(res.text).toContain("12131");
      });
    });

    describe("should redirect to general partner page", () => {
      it(`should redirect to general partner page if ${PartnershipType.PFLP}`, async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.PFLP)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });

      it(`should redirect to general partner page if ${PartnershipType.SPFLP}`, async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.SPFLP)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });
    });
  });

  describe("Post Sic Codes", () => {
    it("should send sic codes and go to the next page - no GP", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.LP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        sic1: "12345",
        sic2: "56789",
        sic3: "91011",
        sic4: "12131"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0].data).toEqual(
        expect.objectContaining({
          sic_codes: ["12345", "56789", "91011", "12131"]
        })
      );
    });

    it("should send sic codes and go to review general partners - GPs", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.LP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        sic1: "12345",
        sic2: "56789",
        sic3: "91011",
        sic4: "12131"
      });

      const REDIRECT_URL = getUrl(REVIEW_GENERAL_PARTNERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0].data).toEqual(
        expect.objectContaining({
          sic_codes: ["12345", "56789", "91011", "12131"]
        })
      );
    });

    it("should send sic codes - only 2 codes", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.LP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        sic1: "12345",
        sic4: "12131"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0].data).toEqual(
        expect.objectContaining({
          sic_codes: ["12345", "12131"]
        })
      );
    });

    it("should return a validation error", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const apiErrors: ApiErrors = {
        errors: { "data.sic": "Sic code must be 5 numeric characters" }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.email,
        sic: "wrong-sic"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Sic code must be 5 numeric characters");
    });
  });
});
