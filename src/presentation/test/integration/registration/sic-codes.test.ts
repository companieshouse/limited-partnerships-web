import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enGeneralTranslationText from "../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../locales/cy/translations.json";
import enSicCodesTranslationText from "../../../../../locales/en/sicCodes.json";
import cySicCodesTranslationText from "../../../../../locales/cy/sicCodes.json";
import enErrorsTranslationText from "../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../locales/cy/errors.json";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled } from "../../utils";
import { ApiErrors } from "../../../../domain/entities/UIErrors";

import { GENERAL_PARTNERS_URL, REVIEW_GENERAL_PARTNERS_URL, SIC_URL } from "../../../controller/registration/url";

import RegistrationPageType from "../../../controller/registration/PageType";

import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";

describe("Sic Codes", () => {
  const URL = getUrl(SIC_URL);
  const REDIRECT_URL = getUrl(GENERAL_PARTNERS_URL);

  const enTranslationText = { ...enGeneralTranslationText, ...enSicCodesTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cySicCodesTranslationText, ...cyErrorsTranslationText };

  beforeEach(() => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withPartnershipType(PartnershipType.LP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

    appDevDependencies.cacheRepository.feedCache({});
  });

  describe("Get Sic Codes Page", () => {
    describe("should load page", () => {
      it("should load the page with English text", async () => {
        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        // testTranslations(res.text, enTranslationText.sicCodes);
        expect(res.text).toContain(`${enTranslationText.sicCodePage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`);
        expect(res.text).not.toContain("WELSH -");
      });

      it("should load the page with Welsh text", async () => {
        setLocalesEnabled(true);

        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        expect(res.text).toContain(`${cyTranslationText.sicCodePage.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`);
        // testTranslations(res.text, cyTranslationText.sicCodes);
        expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
      });

      it("should load the page with cache data", async () => {
        const cacheData = {
          unsavedSicCodes: [
            { code: "12345", description: "SIC Code 12345" },
            { code: "56789", description: "SIC Code 56789" }
          ]
        };

        appDevDependencies.cacheRepository.feedCache(cacheData);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        expect(res.text).toContain("12345");
        expect(res.text).toContain("56789");
      });

      it("should load the page with data", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .withSicCodes(["01120", "01110", "01130", "01140"])
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);

        expect(res.text).toContain("01110");
        expect(res.text).toContain("01120");
        expect(res.text).toContain("01130");
        expect(res.text).toContain("01140");

        expect(appDevDependencies.cacheRepository.getData()).toEqual({
          unsavedSicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
            { code: "01120", description: "Growing of rice" },
            { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
            { code: "01140", description: "Growing of sugar cane" }
          ]
        });
      });

      it("should render teh page with data from the cache and from the API", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .withSicCodes(["91011", "12131"])
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const cacheData = {
          unsavedSicCodes: [
            { code: "12345", description: "SIC Code 12345" },
            { code: "56789", description: "SIC Code 56789" }
          ]
        };

        appDevDependencies.cacheRepository.feedCache(cacheData);

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

  describe("Post Add sic codes", () => {
    it("should add a sic code to the list", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        code: "12345",
        action_add: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("12345");
    });

    it("should not add a duplicate sic code to the list", async () => {
      const cacheData = {
        unsavedSicCodes: [{ code: "12345", description: "SIC Code test" }]
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        code: "12345",
        action_add: "true"
      });

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, "12345")).toBe(2);
    });

    it("should not add more than 4 sic codes to the list", async () => {
      const cacheData = {
        unsavedSicCodes: [
          { code: "12345", description: "SIC Code 12345" },
          { code: "56789", description: "SIC Code 56789" },
          { code: "91011", description: "SIC Code 91011" },
          { code: "12131", description: "SIC Code 12131" }
        ]
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        code: "14151",
        action_add: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).not.toContain("14151");
      expect(res.text).toContain(enTranslationText.errorMessages.sicCodes.maxSicCodes);
    });

    it("should sort sic code list when adding a new code to the list", async () => {
      const cacheData = {
        unsavedSicCodes: [
          { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
          { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
          { code: "01140", description: "Growing of sugar cane" }
        ]
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        code: "01120",
        action_add: "true"
      });

      expect(res.status).toBe(200);

      expect(appDevDependencies.cacheRepository.getData()).toEqual({
        unsavedSicCodes: [
          { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
          { code: "01120", description: "Growing of rice" },
          { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
          { code: "01140", description: "Growing of sugar cane" }
        ]
      });
    });
  });

  describe("Post Remove sic codes", () => {
    it("should remove a sic code from the list", async () => {
      const cacheData = {
        unsavedSicCodes: [
          { code: "12345", description: "SIC Code 12345" },
          { code: "56789", description: "SIC Code 56789" }
        ]
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        code: "12345",
        action_remove: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).not.toContain("12345");
      expect(res.text).toContain("56789");
    });
  });

  describe("Post Sic Codes - send data to API", () => {
    it("should send sic codes and go to the next page - no GP", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.LP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const cacheData = {
        unsavedSicCodes: [
          { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
          { code: "01120", description: "Growing of rice" },
          { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
          { code: "01140", description: "Growing of sugar cane" }
        ]
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0].data).toEqual(
        expect.objectContaining({
          sic_codes: ["01110", "01120", "01130", "01140"]
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

      const cacheData = {
        unsavedSicCodes: [
          { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" }
        ]
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic
      });

      const REDIRECT_URL = getUrl(REVIEW_GENERAL_PARTNERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0].data).toEqual(
        expect.objectContaining({
          sic_codes: ["01110"]
        })
      );
    });

    it("should send sic codes - only 2 codes", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.LP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const cacheData = {
        unsavedSicCodes: [
          { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
          { code: "01130", description: "Growing of vegetables and melons, roots and tubers" }
        ]
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0].data).toEqual(
        expect.objectContaining({
          sic_codes: ["01110", "01130"]
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
