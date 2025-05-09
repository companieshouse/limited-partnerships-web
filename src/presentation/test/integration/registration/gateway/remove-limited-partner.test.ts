import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import { REMOVE_LIMITED_PARTNER_URL, REVIEW_LIMITED_PARTNERS_URL } from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock, { deleteLimitedPartner } from "../../mock/sdkMock";
import { getUrl } from "../../../utils";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Remove Limited Partner page", () => {
  const URL = getUrl(REMOVE_LIMITED_PARTNER_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  it("should delete limited partner", async () => {
    const res = await request(appRealDependencies).post(URL).send({
      pageType: RegistrationPageType.removeLimitedPartner,
      remove: "yes"
    });

    expect(deleteLimitedPartner).toHaveBeenCalled();

    expect(res.status).toBe(302);

    expect(res.text).toContain(getUrl(REVIEW_LIMITED_PARTNERS_URL));
  });

  it("should load error page", async () => {
    mockCreateApiClient.mockReturnValue({
      ...sdkMock,
      limitedPartnershipsService: {
        ...sdkMock.limitedPartnershipsService,
        deleteLimitedPartner: () => ({
          httpStatusCode: 500,
          resource: {}
        })
      }
    });

    const res = await request(appRealDependencies).post(URL).send({
      pageType: RegistrationPageType.removeLimitedPartner,
      remove: "yes"
    });

    expect(deleteLimitedPartner).toHaveBeenCalled();

    expect(res.status).toBe(500);
  });
});
