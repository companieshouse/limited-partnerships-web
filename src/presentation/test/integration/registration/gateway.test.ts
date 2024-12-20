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

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({
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
  },
});

describe("Gateway", () => {
  describe("Create transaction and the first submission", () => {
    beforeAll(() => {
      appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
      appDevDependencies.registrationGateway.feedErrors([]);
    });

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

    it("should update the submission", async () => {
      mockCreateApiClient.mockReturnValue({
        limitedPartnershipsService: {
          ...LimitedPartnershipsService.prototype,
          patchLimitedPartnership: () => ({
            httpStatusCode: 401,
            resource: {},
          }),
        },
        refreshToken: {
          ...RefreshTokenService.prototype,
          refreshToken: () => {},
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
  });
});
