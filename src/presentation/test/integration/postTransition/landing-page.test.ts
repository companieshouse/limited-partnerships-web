import request from "supertest";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { getUrl } from "../../utils";

import { LANDING_PAGE_URL } from "../../../controller/postTransition/url";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import { APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION } from "../../../../config/constants";

describe("Landing page", () => {
  const URL = getUrl(LANDING_PAGE_URL);

  let companyProfile;

  beforeEach(() => {
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION}company_number`]: companyProfile.data.companyNumber
    });
  });

  describe("GET landing page", () => {
    it("should load landing page", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain("Landing page");
      expect(res.text).toContain(companyProfile.data.companyName);
      expect(res.text).toContain(companyProfile.data.companyNumber);
    });
  });
});
