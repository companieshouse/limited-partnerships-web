import request from "supertest";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import app from "../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";

import { APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION } from "../../../../config";
import { CONFIRM_LIMITED_PARTNERSHIP_URL } from "presentation/controller/postTransition/url";

import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";

describe("Confirm correct limited partnership page", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);
  let companyProfile;

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.companyGateway.setError(false);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION}company_number`]: companyProfile.data.companyNumber
    });
  });

  describe("Get confirm limited partnership page", () => {
    it("should load confirm correct limited partnership page with english text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${enTranslationText.confirmLimitedPartnership.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain(companyProfile.data.companyName);
      expect(res.text).toContain(companyProfile.data.companyNumber);
      expect(res.text).toContain(enTranslationText.buttons.continue);
      expect(res.text).not.toContain(enTranslationText.buttons.saveAndContinue);
    });

    it("should load confirm correct limited partnership page with welsh text", async () => {
      setLocalesEnabled(true);

      appDevDependencies.companyGateway.companyProfile.dateOfCreation = "2019-01-11";

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${cyTranslationText.confirmLimitedPartnership.title} - ${cyTranslationText.servicePostTransition} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");
      expect(res.text).toContain("TEST LP");
      expect(res.text).toContain("LP123456");
    });

    it("should return an error if company_number is not valid", async () => {
      appDevDependencies.companyGateway.setError(true);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("The partnership cannot be found");
    });
  });

  describe("Post confirm limited partnership page", () => {
    it(`should redirect to next url`, async () => {
      const companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(0);

      const res = await request(app).post(URL);

      expect(res.status).toBe(302);
      // expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`); // Uncomment this line when LANDING PAGE URL is defined
    });
  });
});
