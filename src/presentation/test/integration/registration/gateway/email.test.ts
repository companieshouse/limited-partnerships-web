import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";
import { RefreshTokenService } from "@companieshouse/api-sdk-node/dist/services/refresh-token";

import appRealDependencies from "../../../../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { EMAIL_URL } from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";
import enTranslationText from "../../../../../../locales/en/translations.json";
import sdkMock from "../../mock/sdkMock";
import { getUrl } from "../../../utils";
import { POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Gateway Update - Refresh Token", () => {
  const URL = getUrl(EMAIL_URL);

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();

    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  describe("Update submission", () => {
    describe("401", () => {
      it("should return an error after failing to refresh the token", async () => {
        mockCreateApiClient.mockReturnValue({
          ...sdkMock,
          limitedPartnershipsService: {
            ...sdkMock.limitedPartnershipsService,
            patchLimitedPartnership: () => ({
              httpStatusCode: 401,
              resource: {}
            })
          },
          refreshToken: {
            ...RefreshTokenService.prototype,
            refresh: () => {}
          }
        });

        const res = await request(appRealDependencies).post(URL).send({
          pageType: RegistrationPageType.email,
          email: "test@email.com"
        });

        expect(res.status).toBe(500);
      });

      it("should update the submission after refreshing the token", async () => {
        let patchLimitedPartnership = {
          httpStatusCode: 401,
          resource: {}
        };

        const refreshToken = jest.fn().mockImplementation(() => {
          patchLimitedPartnership = {
            httpStatusCode: 200,
            resource: {}
          };

          return {
            resource: { access_token: "access_token" }
          };
        });

        mockCreateApiClient.mockReturnValue({
          ...sdkMock,
          limitedPartnershipsService: {
            ...sdkMock.limitedPartnershipsService,
            patchLimitedPartnership: () => patchLimitedPartnership
          },
          refreshToken: {
            ...sdkMock.refreshToken,
            refresh: refreshToken
          }
        });

        const res = await request(appRealDependencies).post(URL).send({
          pageType: RegistrationPageType.email,
          email: "test@email.com"
        });

        expect(refreshToken).toHaveBeenCalled();

        const REDIRECT_URL = getUrl(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      });
    });

    describe("400", () => {
      it("should return validation errors - email page", async () => {
        mockCreateApiClient.mockReturnValue({
          ...sdkMock,
          limitedPartnershipsService: {
            ...sdkMock.limitedPartnershipsService,
            patchLimitedPartnership: () => ({
              httpStatusCode: 400,
              resource: {
                errors: {
                  "data.email": "must be a well-formed email address"
                }
              }
            })
          }
        });

        const res = await request(appRealDependencies).post(URL).send({
          pageType: RegistrationPageType.email,
          email: "test@email.com"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain("must be a well-formed email address");
      });
    });
  });

  describe("Get Limited Parnership", () => {
    it("should load the name page with data from api", async () => {
      const res = await request(appRealDependencies).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.emailPage.whatIsEmail);
    });

    it("should load error page if submissionId is incorrect", async () => {
      mockCreateApiClient.mockReturnValue({
        ...sdkMock,
        limitedPartnershipsService: {
          ...sdkMock.limitedPartnershipsService,
          getLimitedPartnership: () => ({
            httpStatusCode: 404,
            errors: ["Not Found"]
          })
        }
      });

      const url = appDevDependencies.registrationController.insertIdsInUrl(
        EMAIL_URL,
        appDevDependencies.transactionGateway.transactionId,
        "wrong-id"
      );

      const res = await request(appRealDependencies).get(url);

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});
