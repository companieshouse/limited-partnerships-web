import request from "supertest";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";

import { COMPANY_NOT_LIMITED_PARTNERSHIP_URL } from "../../../controller/global/url";
import { CONFIRM_LIMITED_PARTNERSHIP_URL } from "../../../controller/transition/url";
import { JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";

import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";

describe("Company not a limited partnership", () => {
  const URL = getUrl(COMPANY_NOT_LIMITED_PARTNERSHIP_URL).replace(JOURNEY_TYPE_PARAM, Journey.transition);
  const CONFIRM_URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.filingHistoryGateway.feedFilingHistoryItems([]);
    appDevDependencies.companyGateway.setError(false);
  });

  describe("when the company is not a limited partnership", () => {
    beforeEach(() => {
      const companyProfile = new CompanyProfileBuilder().withType("ltd").build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    });

    it("should render the page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.companyNotLimitedPartnership);
      expect(res.text).not.toContain("govuk-back-link");
    });

    it("should render the page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.companyNotLimitedPartnership);
    });

    it("should redirect from the confirm page GET and keep the query string", async () => {
      const res = await request(app).get(CONFIRM_URL + "?lang=cy");

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${URL}?lang=cy`);
    });

    it("should redirect from the confirm page POST", async () => {
      const res = await request(app).post(CONFIRM_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${URL}`);
    });
  });

  describe("when the company is a limited partnership", () => {
    beforeEach(() => {
      const companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    });

    it("should not redirect from the confirm page", async () => {
      const res = await request(app).get(CONFIRM_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.partnership.confirmLimitedPartnership.title);
    });
  });

  describe("when the company cannot be found", () => {
    it("should not redirect from the confirm page", async () => {
      appDevDependencies.companyGateway.setError(true);

      const res = await request(app).get(CONFIRM_URL);

      expect(res.status).toBe(200);
      expect(res.text).not.toContain(`Redirecting to ${URL}`);
    });
  });
});
