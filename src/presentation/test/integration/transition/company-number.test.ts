import request from "supertest";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { COMPANY_NUMBER_URL } from "../../../../presentation/controller/transition/url";
import TransitionPageType from "../../../controller/transition/PageType";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { APPLICATION_CACHE_KEY, APPLICATION_CACHE_KEY_PREFIX_TRANSITION, SERVICE_NAME_TRANSITION } from "../../../../config/constants";

describe("Company number page", () => {
  const URL = getUrl(COMPANY_NUMBER_URL);

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("GET company number", () => {
    it("should load company number page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.companyNumber);
      expect(res.text).toContain(
        `${enTranslationText.companyNumber.whatIsPartnershipNumber} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain(SERVICE_NAME_TRANSITION);
    });

    it("should load company number page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.companyNumber);
      expect(res.text).toContain(
        `${cyTranslationText.companyNumber.whatIsPartnershipNumber} - ${cyTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");
      expect(res.text).toContain(SERVICE_NAME_TRANSITION);
    });
  });

  describe("POST company number", () => {
    it("should redirect to confirmation page if company_number is valid", async () => {
      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.companyNumber,
        company_number: "LP123456"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain("Redirecting to /limited-partnerships/transition/confirm-limited-partnership");

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [`${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`]: "LP123456"
        }
      });
    });

    it("should return an error if company_number is not valid", async () => {
      appDevDependencies.companyGateway.setError(true);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.companyNumber,
        company_number: "LP123456"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("The partnership cannot be found");
    });
  });
});
