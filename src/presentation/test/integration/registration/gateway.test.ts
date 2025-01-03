import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";
import {
  LimitedPartnershipsService,
  NameEndingType,
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
        id: appDevDependencies.registrationGateway.transactionId,
      },
    }),
  },
  limitedPartnershipsService: {
    ...LimitedPartnershipsService.prototype,
    postLimitedPartnership: () => ({
      httpStatusCode: 201,
      resource: {
        id: appDevDependencies.registrationGateway.submissionId,
      },
    }),
    patchLimitedPartnership: () => ({
      httpStatusCode: 200,
      resource: {},
    }),
    getLimitedPartnership: () => ({
      httpStatusCode: 200,
      resource: new LimitedPartnershipBuilder().build(),
    }),
  },
  refreshToken: {
    ...RefreshTokenService.prototype,
    refresh: {
      httpStatusCode: 201,
      resource: { access_token: "access_token" },
    },
  },
};

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(value);

describe("Gateway", () => {
  beforeEach(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);

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
        partnership_type: "LP",
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
        email: "test@email.com",
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/${appDevDependencies.registrationGateway.submissionId}/general-partners`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    describe("401", () => {
      it("should retrun after failing to refresh the token", async () => {
        mockCreateApiClient.mockReturnValue({
          ...value,
          limitedPartnershipsService: {
            ...value.limitedPartnershipsService,
            patchLimitedPartnership: () => ({
              httpStatusCode: 401,
              resource: {},
            }),
          },
          refreshToken: {
            ...RefreshTokenService.prototype,
            refresh: () => {},
          },
        });

        const url = appDevDependencies.registrationController.insertIdsInUrl(
          EMAIL_URL,
          appDevDependencies.registrationGateway.transactionId,
          appDevDependencies.registrationGateway.submissionId
        );

        const res = await request(appRealDependencies).post(url).send({
          pageType: RegistrationPageType.email,
          email: "test@email.com",
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.emailPage.whatIsEmail);
      });

      it("should update the submission after refreshing the token", async () => {
        const refreshToken = jest.fn().mockImplementation(() => ({
          resource: { access_token: "access_token" },
        }));

        mockCreateApiClient.mockReturnValue({
          ...value,
          limitedPartnershipsService: {
            ...value.limitedPartnershipsService,
            patchLimitedPartnership: () => ({
              httpStatusCode: 401,
              resource: {},
            }),
          },
          refreshToken: {
            ...value.refreshToken,
            refresh: refreshToken,
          },
        });

        const url = appDevDependencies.registrationController.insertIdsInUrl(
          EMAIL_URL,
          appDevDependencies.registrationGateway.transactionId,
          appDevDependencies.registrationGateway.submissionId
        );

        const res = await request(appRealDependencies).post(url).send({
          pageType: RegistrationPageType.email,
          email: "test@email.com",
        });

        expect(refreshToken).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.emailPage.whatIsEmail);
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
            errors: ["Not Found"],
          }),
        },
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
