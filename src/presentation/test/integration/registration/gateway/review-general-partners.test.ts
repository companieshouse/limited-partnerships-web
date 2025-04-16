import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import { REVIEW_GENERAL_PARTNERS_URL } from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock, { getGeneralPartners } from "../../mock/sdkMock";
import { getUrl } from "../../../utils";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

jest.mock("../../../../../infrastructure/repository/CacheRepository");

describe("Review General Partner page", () => {
  const URL = getUrl(REVIEW_GENERAL_PARTNERS_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  it("should load General Partner page with data", async () => {
    const res = await request(appRealDependencies).get(URL).send({
      pageType: RegistrationPageType.reviewGeneralPartners
    });

    expect(getGeneralPartners).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.text).toContain("Joe");
    expect(res.text).toContain("Doe");
  });

  it("should load error page", async () => {
    mockCreateApiClient.mockReturnValue({
      ...sdkMock,
      limitedPartnershipsService: {
        ...sdkMock.limitedPartnershipsService,
        getGeneralPartners: () => ({
          httpStatusCode: 500,
          resource: []
        })
      }
    });

    const res = await request(appRealDependencies).get(URL).send({
      pageType: RegistrationPageType.reviewGeneralPartners
    });

    expect(getGeneralPartners).toHaveBeenCalled();
    expect(res.status).toBe(500);
  });
});
