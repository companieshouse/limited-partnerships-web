import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import sdkMock, { getCompanyProfile } from "../../mock/sdkMock";

import { getUrl } from "../../../utils";
import { CONFIRM_LIMITED_PARTNERSHIP_URL } from "../../../../controller/transition/url";
import FilingHistoryBuilder from "../../../builder/FilingHistoryBuilder";
import { enTranslationText } from "../../../../../test/utils/locales";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;

// Filing history without a transition form, so the confirm page is not redirected to "already filed"
const sdkMockNotFiled = {
  ...sdkMock,
  companyFilingHistory: {
    ...sdkMock.companyFilingHistory,
    getCompanyFilingHistory: () => ({
      httpStatusCode: 200,
      resource: {
        filing_history_status: "filing-history-available-limited-partnership-from-2014",
        items: [new FilingHistoryBuilder().withType("LP6D").build()],
        items_per_page: 25,
        start_index: 0,
        total_count: 1
      }
    })
  }
};

describe("Company Profile", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMockNotFiled);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("getCompanyProfile", () => {
    it("should find the company and load the confirm limited partnership page", async () => {
      const res = await request(appRealDependencies).get(URL);

      expect(getCompanyProfile).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.partnership.confirmLimitedPartnership.title);
      expect(res.text).toContain("TEST LP");
    });

    it("should render page not found when the company cannot be found", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMockNotFiled,
        companyProfile: {
          ...sdkMockNotFiled.companyProfile,
          getCompanyProfile: () => ({
            httpStatusCode: 404,
            resource: null
          })
        }
      });

      const res = await request(appRealDependencies).get(URL);

      expect(res.status).toBe(404);
      expect(res.text).toContain(enTranslationText.pageNotFound.title);
    });
  });
});
