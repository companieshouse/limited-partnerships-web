import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { CONFIRM_LIMITED_PARTNERSHIP_URL } from "presentation/controller/transition/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { APPLICATION_CACHE_KEY_PREFIX_TRANSITION } from "../../../../config";

describe("Confirm correct limited partnership page", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

  beforeEach(() => {
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get confirm limited partnership page", () => {
    it("should load confirm correct limited partnership page with english text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`]:
          "LP123456"
      });

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${enTranslationText.confirmLimitedPartnership.title} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain("TEST COMPANY");
      expect(res.text).toContain("LP123456");
      expect(res.text).toContain("1 January 2019");
    });

    it("should load confirm correct limited partnership page with welsh text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [`${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`]:
          "LP123456"
      });

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${cyTranslationText.confirmLimitedPartnership.title} - ${cyTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");
      expect(res.text).toContain("TEST COMPANY");
      expect(res.text).toContain("LP123456");
      expect(res.text).toContain("1 WELSH - January 2019");
    });

    it("should return an error if company_number is not valid", async () => {
      appDevDependencies.companyGateway.setError(true);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("The partnership cannot be found");
    });
  });
});
