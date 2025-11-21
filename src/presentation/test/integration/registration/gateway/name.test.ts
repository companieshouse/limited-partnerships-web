import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";
import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import appRealDependencies from "../../../../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { EMAIL_URL, NAME_URL, WHERE_IS_THE_JURISDICTION_URL } from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock, {
  postLimitedPartnership,
  postLimitedPartnershipIncorporation,
  postTransaction
} from "../../mock/sdkMock";
import { getUrl } from "../../../utils";
import enTranslationText from "../../../../../../locales/en/translations.json";
import CacheRepository from "../../../../../infrastructure/repository/CacheRepository";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

jest.mock("../../../../../infrastructure/repository/CacheRepository");
const mockSession = CacheRepository as jest.Mock;
mockSession.mockReturnValue({
  getData: jest.fn().mockImplementation(() => ({
    limited_partnership: { "registration_partnership-type": "LP" }
  }))
});

describe("Gateway Transaction - Incorporation - Partnership", () => {
  const URL = getUrl(NAME_URL);

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();

    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  describe("Create transaction and the first submission", () => {
    it("should create a transaction and the first submission", async () => {
      const res = await request(appRealDependencies).post(NAME_URL).send({
        pageType: RegistrationPageType.name,
        partnership_name: "Test Limited Partnership",
        name_ending: NameEndingType.LIMITED_PARTNERSHIP,
        partnership_type: "LP"
      });

      expect(postTransaction).toHaveBeenCalled();
      expect(postLimitedPartnershipIncorporation).toHaveBeenCalled();
      expect(postLimitedPartnership).toHaveBeenCalled();

      const REDIRECT_URL = getUrl(EMAIL_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });

  describe("Update submission", () => {
    it("should update the submission", async () => {
      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.email,
        email: "test@email.com"
      });

      const REDIRECT_URL = getUrl(WHERE_IS_THE_JURISDICTION_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    describe("400", () => {
      it("should return validation errors - name page", async () => {
        mockCreateApiClient.mockReturnValue({
          ...sdkMock,
          limitedPartnershipsService: {
            ...sdkMock.limitedPartnershipsService,
            postLimitedPartnershipIncorporation: () => ({
              httpStatusCode: 400,
              resource: {
                errors: {
                  incorporation: "Something is wrong"
                }
              }
            })
          }
        });

        const res = await request(appRealDependencies).post(NAME_URL).send({
          pageType: RegistrationPageType.name
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain("Something is wrong");
      });
    });
  });

  describe("500", () => {
    it("should load error page", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        limitedPartnershipsService: {
          ...sdkMock.limitedPartnershipsService,
          postLimitedPartnershipIncorporation: () => ({
            httpStatusCode: 500,
            resource: {}
          })
        }
      });

      const res = await request(appRealDependencies).post(NAME_URL).send({
        pageType: RegistrationPageType.name
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});
