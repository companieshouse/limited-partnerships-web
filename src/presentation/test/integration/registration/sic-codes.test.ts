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
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../utils";
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
      .withSicCodes([])
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
        testTranslations(res.text, enTranslationText.sicCodes, ["removeButton"]);
        expect(res.text).toContain(`${enTranslationText.sicCodes.title} - ${enTranslationText.serviceRegistration} - GOV.UK`);
        expect(res.text).not.toContain("WELSH -");
      });

      it("should load the page with Welsh text", async () => {
        setLocalesEnabled(true);

        const res = await request(app).get(URL + "?lang=cy");

        expect(res.status).toBe(200);
        testTranslations(res.text, cyTranslationText.sicCodes, ["removeButton"]);
        expect(res.text).toContain(`${cyTranslationText.sicCodes.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`);
        expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
      });

      it("should load the page with cache data", async () => {
        const cacheData = {
          [appDevDependencies.transactionGateway.transactionId]: {
            sicCodes: [
              { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
              { code: "01120", description: "Growing of rice" }
            ]
          }
        };

        appDevDependencies.cacheRepository.feedCache(cacheData);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        expect(res.text).toContain("01110");
        expect(res.text).toContain("01120");
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
          [appDevDependencies.transactionGateway.transactionId]: {
            sicCodes: [
              { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
              { code: "01120", description: "Growing of rice" },
              { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
              { code: "01140", description: "Growing of sugar cane" }
            ]
          }
        });
      });

      it("should render teh page with data from the cache and from the API", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withPartnershipType(PartnershipType.LP)
          .withSicCodes(["01110", "01120"])
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const cacheData = {
          [appDevDependencies.transactionGateway.transactionId]: {
            sicCodes: [
              { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
              { code: "01140", description: "Growing of sugar cane" }
            ]
          }
        };

        appDevDependencies.cacheRepository.feedCache(cacheData);

        const res = await request(app).get(URL + "?lang=en");

        expect(res.status).toBe(200);
        expect(res.text).toContain("01110");
        expect(res.text).toContain("01120");
        expect(res.text).toContain("01130");
        expect(res.text).toContain("01140");
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
      const cacheData = {
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
            { code: "01120", description: "Growing of rice" },
            { code: "01130", description: "Growing of vegetables and melons, roots and tubers" }
          ]
        }
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        codeToAdd: "01140, Growing of sugar cane",
        action_add: "true"
      });

      expect(res.status).toBe(200);

      expect(countOccurrences(res.text, "01140")).toBe(2);
      expect(res.text).not.toContain(enTranslationText.sicCodes.addButton);

    });

    it("should not add a duplicate sic code to the list", async () => {
      const cacheData = {
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [{ code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" }]
        }
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        codeToAdd: "01110, Growing of cereals (except rice), leguminous crops and oil seeds",
        action_add: "true"
      });

      expect(res.status).toBe(200);

      expect(countOccurrences(res.text, "01110")).toBe(3);
      expect(res.text).toContain(enTranslationText.errorMessages.sicCodes.sicCodeDuplicate);
    });

    it("should not add an invalid sic code to the list", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        codeToAdd: "12345, Invalid SIC Code",
        action_add: "true"
      });

      expect(res.status).toBe(200);

      expect(countOccurrences(res.text, "12345")).toBe(0);
      expect(res.text).toContain(enTranslationText.errorMessages.sicCodes.sicCodeInvalid);
    });

    it("should not add more than 4 sic codes to the list", async () => {
      const cacheData = {
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
            { code: "01120", description: "Growing of rice" },
            { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
            { code: "01140", description: "Growing of sugar cane" }
          ]
        }
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        codeToAdd: "01150, Growing of maize",
        action_add: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).not.toContain("01150");
      expect(res.text).toContain(enTranslationText.errorMessages.sicCodes.maxSicCodes);
    });

    it("should sort sic code list when adding a new code to the list", async () => {
      const cacheData = {
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
            { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
            { code: "01140", description: "Growing of sugar cane" }
          ]
        }
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        codeToAdd: "01120, Growing of rice",
        action_add: "true"
      });

      expect(res.status).toBe(200);

      expect(appDevDependencies.cacheRepository.getData()).toEqual({
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
            { code: "01120", description: "Growing of rice" },
            { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
            { code: "01140", description: "Growing of sugar cane" }
          ]
        }
      });
    });

    it("should return an error if the sic codes list is empty", async () => {
      appDevDependencies.cacheRepository.feedCache({
        sicCodes: []
      });

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.sicCodes.sicCodeRequired);
    });

    it("should return the code if no description is provided", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        codeToAdd: "01110",
        action_add: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("01110");
      expect(appDevDependencies.cacheRepository.getData()).toEqual({
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" }
          ]
        }
      });
    });
  });

  describe("Post Remove sic codes", () => {
    it("should remove a sic code from the list", async () => {
      const cacheData = {
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
            { code: "01120", description: "Growing of rice" }
          ]
        }
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic,
        action_remove: "01110"
      });

      expect(res.status).toBe(200);

      expect(countOccurrences(res.text, "01110")).toBe(1);
      expect(res.text).toContain("01120");
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
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
            { code: "01120", description: "Growing of rice" },
            { code: "01130", description: "Growing of vegetables and melons, roots and tubers" },
            { code: "01140", description: "Growing of sugar cane" }
          ]
        }
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
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [{ code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" }]
        }
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
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [
            { code: "01110", description: "Growing of cereals (except rice), leguminous crops and oil seeds" },
            { code: "01130", description: "Growing of vegetables and melons, roots and tubers" }
          ]
        }
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

      const cacheData = {
        [appDevDependencies.transactionGateway.transactionId]: {
          sicCodes: [{ code: "000", description: "Wrong sic code" }]
        }
      };

      appDevDependencies.cacheRepository.feedCache(cacheData);

      const apiErrors: ApiErrors = {
        errors: { "data.sic_codes": "Sic code must be 5 numeric characters" }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.sic
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Sic code must be 5 numeric characters");
    });
  });
});
