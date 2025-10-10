import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import sdkMock, { getCompanyAppointment, getCompanyProfile } from "../../mock/sdkMock";

import { getUrl } from "../../../utils";
import { WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL } from "../../../../controller/postTransition/url";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Company Appointment", () => {
  const URL = getUrl(WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  describe("getCompanyAppointment", () => {
    it("should find the company then redirect to the next page", async () => {
      const res = await request(appRealDependencies).get(URL);

      expect(getCompanyProfile).toHaveBeenCalled();
      expect(getCompanyAppointment).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.text).toContain(new CompanyAppointmentBuilder().build().name?.split(",")[0] ?? "");
    });

    it("should load error page when error thrown from getCompanyAppointment", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        companyOfficers: {
          ...sdkMock.companyOfficers,
          getCompanyAppointment: () => ({
            httpStatusCode: 404,
            resource: null
          })
        }
      });

      const res = await request(appRealDependencies).get(URL);

      expect(res.status).toBe(200);
    });
  });
});
