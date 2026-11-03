import request from "supertest";

import app from "../../app";
import { getUrl, setLocalesEnabled } from "../../../utils";
import { COMPANY_NUMBER_URL } from "../../../../../presentation/controller/transition/url";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

describe("Company number page", () => {
  const URL = getUrl(COMPANY_NUMBER_URL);

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  describe("GET company number", () => {
    it("should load company number page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(
        "/company-lookup/search?forward=/limited-partnerships/transition/confirm-limited-partnership?companyNumber=%7BcompanyNumber%7D&backLink=/limited-partnerships/transition/continue-saved-filing"
      );
    });

    it("should load company number page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(
        "/company-lookup/search?forward=/limited-partnerships/transition/confirm-limited-partnership?companyNumber=%7BcompanyNumber%7D&backLink=/limited-partnerships/transition/continue-saved-filing"
      );
    });
  });
});
