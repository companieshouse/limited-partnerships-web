import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";
import enTranslationText from "../../../../../../locales/en/translations.json";
import {
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL
} from "../../../../controller/registration/url";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../utils";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock from "../../mock/sdkMock";
import appRealDependencies from "../../../../../app";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Add Limited Partner Person Page", () => {
  const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  describe("200", () => {
    it("should add a limited partner person", async () => {
      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson
      });

      expect(res.status).toBe(302);
    });

    it("should update a limited partner person", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL);

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson,
        forename: "Joe",
        surname: "Doe",
        "date_of_birth-day": "01",
        "date_of_birth-month": "01",
        "date_of_birth-year": "2001",
        nationality1: "BRITISH",
        former_names: "previous name",
        previousNames: "false"
      });
      expect(res.status).toBe(302);
    });
  });

  describe("400", () => {
    it("should return validation errors - add limited partner person page", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        limitedPartnershipsService: {
          ...sdkMock.limitedPartnershipsService,
          postLimitedPartner: () => ({
            httpStatusCode: 400,
            resource: {
              errors: {
                personName: "Invalid value for person name"
              }
            }
          })
        }
      });

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Invalid value for person name");
    });

    it("should return validation errors - add limited partner person page", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        limitedPartnershipsService: {
          ...sdkMock.limitedPartnershipsService,
          patchLimitedPartner: () => ({
            httpStatusCode: 400,
            resource: {
              errors: {
                personName: "Invalid value for person name"
              }
            }
          })
        }
      });
      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL);

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Invalid value for person name");
    });
  });

  describe("500", () => {
    it("should load error page", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        limitedPartnershipsService: {
          ...sdkMock.limitedPartnershipsService,
          postLimitedPartner: () => ({
            httpStatusCode: 500,
            resource: {}
          })
        }
      });

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addLimitedPartnerPerson
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});
