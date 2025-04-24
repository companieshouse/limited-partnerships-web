import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import { REMOVE_GENERAL_PARTNER_URL, REVIEW_GENERAL_PARTNERS_URL } from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock, { deleteGeneralPartner } from "../../mock/sdkMock";
import { getUrl } from "../../../utils";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Review General Partner page", () => {
  const URL = getUrl(REMOVE_GENERAL_PARTNER_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  it("should delete general partner", async () => {
    const res = await request(appRealDependencies).post(URL).send({
      pageType: RegistrationPageType.removeGeneralPartner,
      remove: "yes"
    });

    expect(deleteGeneralPartner).toHaveBeenCalled();

    expect(res.status).toBe(302);

    expect(res.header.location).toBe(getUrl(REVIEW_GENERAL_PARTNERS_URL));
  });

  it("should load error page", async () => {
    mockCreateApiClient.mockReturnValue({
      ...sdkMock,
      limitedPartnershipsService: {
        ...sdkMock.limitedPartnershipsService,
        deleteGeneralPartner: () => ({
          httpStatusCode: 500,
          resource: {}
        })
      }
    });

    const res = await request(appRealDependencies).post(URL).send({
      pageType: RegistrationPageType.removeGeneralPartner,
      remove: "yes"
    });

    expect(deleteGeneralPartner).toHaveBeenCalled();

    expect(res.status).toBe(500);
  });
});
