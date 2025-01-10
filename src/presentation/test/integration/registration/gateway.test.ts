import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";
import {
  LimitedPartnershipsService,
  NameEndingType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";

import appRealDependencies from "../../../../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { EMAIL_URL, NAME_URL } from "../../../controller/registration/Routing";
import RegistrationPageType from "../../../controller/registration/PageType";
import enTranslationText from "../../../../../locales/en/translations.json";
import { RefreshTokenService } from "@companieshouse/api-sdk-node/dist/services/refresh-token";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";

jest.mock("@companieshouse/api-sdk-node");

const value = {
  transaction: {
    ...TransactionService.prototype,
    postTransaction: () => ({
      httpStatusCode: 201,
      resource: {
        id: appDevDependencies.registrationGateway.transactionId
      }
    })
  },
  limitedPartnershipsService: {
    ...LimitedPartnershipsService.prototype,
    postLimitedPartnership: () => ({
      httpStatusCode: 201,
      resource: {
        id: appDevDependencies.registrationGateway.submissionId
      }
    }),
    patchLimitedPartnership: () => ({
      httpStatusCode: 200,
      resource: {}
    }),
    getLimitedPartnership: () => ({
      httpStatusCode: 200,
      resource: new LimitedPartnershipBuilder().build()
    })
  },
  refreshToken: {
    ...RefreshTokenService.prototype,
    refresh: {
      httpStatusCode: 201,
      resource: { access_token: "access_token" }
    }
  }
};

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(value);

describe("Gateway", () => {
  beforeEach(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors();

    mockCreateApiClient.mockReturnValue(value);
  });

  describe("Create transaction and the first submission", () => {
    it("should create a transaction and the first submission", async () => {
      const url = appDevDependencies.registrationController.insertIdsInUrl(
        NAME_URL,
        appDevDependencies.registrationGateway.transactionId,
        appDevDependencies.registrationGateway.submissionId
      );

      const res = await request(appRealDependencies).post(url).send({
        pageType: RegistrationPageType.name,
        partnership_name: "Test Limited Partnership",
        name_ending: NameEndingType.LIMITED_PARTNERSHIP,
        partnership_type: "LP"
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/${appDevDependencies.registrationGateway.submissionId}/email`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });

  describe("Update submission", () => {
    it("should update the submission", async () => {
      const url = appDevDependencies.registrationController.insertIdsInUrl(
        EMAIL_URL,
        appDevDependencies.registrationGateway.transactionId,
        appDevDependencies.registrationGateway.submissionId
      );

      const res = await request(appRealDependencies).post(url).send({
        pageType: RegistrationPageType.email,
        email: "test@email.com"
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/${appDevDependencies.registrationGateway.submissionId}/general-partners`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    describe("401", () => {
      it("should return an error after failing to refresh the token", async () => {
        mockCreateApiClient.mockReturnValue({
          ...value,
          limitedPartnershipsService: {
            ...value.limitedPartnershipsService,
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

        const url = appDevDependencies.registrationController.insertIdsInUrl(
          EMAIL_URL,
          appDevDependencies.registrationGateway.transactionId,
          appDevDependencies.registrationGateway.submissionId
        );

        const res = await request(appRealDependencies).post(url).send({
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
          ...value,
          limitedPartnershipsService: {
            ...value.limitedPartnershipsService,
            patchLimitedPartnership: () => patchLimitedPartnership
          },
          refreshToken: {
            ...value.refreshToken,
            refresh: refreshToken
          }
        });

        const url = appDevDependencies.registrationController.insertIdsInUrl(
          EMAIL_URL,
          appDevDependencies.registrationGateway.transactionId,
          appDevDependencies.registrationGateway.submissionId
        );

        const res = await request(appRealDependencies).post(url).send({
          pageType: RegistrationPageType.email,
          email: "test@email.com"
        });

        expect(refreshToken).toHaveBeenCalled();

        const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/${appDevDependencies.registrationGateway.submissionId}/general-partners`;

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      });
    });

    describe("400", () => {
      it("should return validation errors - name page", async () => {
        mockCreateApiClient.mockReturnValue({
          ...value,
          limitedPartnershipsService: {
            ...value.limitedPartnershipsService,
            postLimitedPartnership: () => ({
              httpStatusCode: 400,
              resource: {
                errors: {
                  "data.partnershipName": "partnership_name must be less than 160"
                }
              }
            })
          }
        });

        const url = appDevDependencies.registrationController.insertIdsInUrl(
          NAME_URL,
          appDevDependencies.registrationGateway.transactionId,
          appDevDependencies.registrationGateway.submissionId
        );

        const res = await request(appRealDependencies).post(url).send({
          pageType: RegistrationPageType.name
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain("partnership_name must be less than 160");
      });

      it("should return validation errors - email page", async () => {
        mockCreateApiClient.mockReturnValue({
          ...value,
          limitedPartnershipsService: {
            ...value.limitedPartnershipsService,
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

        const url = appDevDependencies.registrationController.insertIdsInUrl(
          EMAIL_URL,
          appDevDependencies.registrationGateway.transactionId,
          appDevDependencies.registrationGateway.submissionId
        );

        const res = await request(appRealDependencies).post(url).send({
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
      const url = appDevDependencies.registrationController.insertIdsInUrl(
        EMAIL_URL,
        appDevDependencies.registrationGateway.transactionId,
        appDevDependencies.registrationGateway.submissionId
      );

      const res = await request(appRealDependencies).get(url);

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.emailPage.whatIsEmail);
    });

    it("should load error page if submissionId is incorrect", async () => {
      mockCreateApiClient.mockReturnValue({
        ...value,
        limitedPartnershipsService: {
          ...value.limitedPartnershipsService,
          getLimitedPartnership: () => ({
            httpStatusCode: 404,
            errors: ["Not Found"]
          })
        }
      });

      const url = appDevDependencies.registrationController.insertIdsInUrl(
        EMAIL_URL,
        appDevDependencies.registrationGateway.transactionId,
        "wrong-id"
      );

      const res = await request(appRealDependencies).get(url);

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});
