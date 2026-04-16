import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import {
  REMOVE_PERSON_WITH_SIGNIFICANT_CONTROL_URL,
  REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL
} from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock, { deletePersonWithSignificantControl } from "../../mock/sdkMock";
import { getUrl } from "../../../utils";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Remove Person With Significant Control page", () => {
  const URL = getUrl(REMOVE_PERSON_WITH_SIGNIFICANT_CONTROL_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  it("should delete person with significant control", async () => {
    const res = await request(appRealDependencies).post(URL).send({
      pageType: RegistrationPageType.removePersonWithSignificantControl,
      remove: "yes"
    });

    expect(deletePersonWithSignificantControl).toHaveBeenCalled();

    expect(res.status).toBe(302);

    expect(res.header.location).toBe(getUrl(REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL));
  });

  it("should load error page", async () => {
    mockCreateApiClient.mockReturnValue({
      ...sdkMock,
      limitedPartnershipsService: {
        ...sdkMock.limitedPartnershipsService,
        deletePersonWithSignificantControl: () => ({
          httpStatusCode: 500,
          resource: {}
        })
      }
    });

    const res = await request(appRealDependencies).post(URL).send({
      pageType: RegistrationPageType.removePersonWithSignificantControl,
      remove: "yes"
    });

    expect(deletePersonWithSignificantControl).toHaveBeenCalled();

    expect(res.status).toBe(500);
  });
});
