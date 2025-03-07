import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import sdkMock, { getCompanyProfile } from "../../mock/sdkMock";

import { getUrl } from "../../../utils";
import { COMPANY_NUMBER_URL } from "../../../../controller/transition/url";
import TransitionPageType from "../../../../controller/transition/PageType";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Comapny Profile", () => {
  const URL = getUrl(COMPANY_NUMBER_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("getCompanyProfile", () => {
    it("should find the company then redirect to the next page", async () => {
      const res = await request(appRealDependencies).post(URL).send({
        pageType: TransitionPageType.companyNumber,
        company_number: "LP123456"
      });

      expect(getCompanyProfile).toHaveBeenCalled();

      expect(res.status).toBe(302);
      expect(res.text).toContain("Redirecting to /limited-partnerships/transition/confirm-limited-partnership");
    });

    it("should load error page when error thrown from getCompanyProfile", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        companyProfile: {
          ...sdkMock.companyProfile,
          getCompanyProfile: () => ({
            httpStatusCode: 404,
            resource: null
          })
        }
      });

      const res = await request(appRealDependencies).post(URL).send({
        pageType: TransitionPageType.companyNumber,
        company_number: "wrong"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("The partnership cannot be found");
    });
  });
});
