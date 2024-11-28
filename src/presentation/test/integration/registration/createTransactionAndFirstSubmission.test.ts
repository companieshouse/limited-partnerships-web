import request from "supertest";
import { Request, Response } from "express";
import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../app";
import appRealDependencies from "../../../../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import {
  NAME_URL,
  registrationRoutingName,
} from "../../../controller/registration/Routing";

import { createApiClient } from "@companieshouse/api-sdk-node";
import TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";
jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/transaction/service");

describe("Create transaction and the first submission", () => {
  beforeAll(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
  });

  it("should load the name page with status 200", async () => {
    const res = await request(app).get(NAME_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain("What is the limited partnership name?");
  });

  it("should create a transaction and the first submission", async () => {
    const url = appDevDependencies.registrationController.insertIdsInUrl(
      NAME_URL,
      appDevDependencies.registrationGateway.transactionId,
      appDevDependencies.registrationGateway.submissionId
    );

    const res = await request(app).post(url).send({
      pageType: registrationRoutingName.pageType,
      partnership_name: "Test Limited Partnership",
      name_ending: NameEndingType.LIMITED_PARTNERSHIP,
    });

    const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/${appDevDependencies.registrationGateway.submissionId}/next`;

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
  });

  it("should create a transaction and the first submission - appRealDependencies and mock", async () => {
    const url = appDevDependencies.registrationController.insertIdsInUrl(
      NAME_URL,
      appDevDependencies.registrationGateway.transactionId,
      appDevDependencies.registrationGateway.submissionId
    );

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
    });

    const res = await request(appRealDependencies).post(url).send({
      pageType: registrationRoutingName.pageType,
      partnership_name: "Test Limited Partnership",
      name_ending: NameEndingType.LIMITED_PARTNERSHIP,
    });

    const partialRedirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/`;

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${partialRedirectUrl}`);
  });

  it("should return an error", async () => {
    const url = appDevDependencies.registrationController.insertIdsInUrl(
      NAME_URL,
      appDevDependencies.registrationGateway.transactionId,
      appDevDependencies.registrationGateway.submissionId
    );

    const res = await request(app).post(url).send({
      pageType: registrationRoutingName.pageType,
    });

    expect(res.status).toBe(200);
    // see when and where to display errors from the API
  });

  it("should return a status 500 if page type doesn't exist - sq", async () => {
    const res = await request(app).post(NAME_URL).send({
      pageType: "wrong-page-type",
    });

    expect(res.status).toBe(500);
  });

  it("should call next if type in path is incorrect - sq", async () => {
    const next = jest.fn();

    await appDevDependencies.globalController.getPageRouting()(
      {
        path: "/limited-partnerships/wrong-type",
      } as Request,
      {} as Response,
      next
    );

    expect(next).toHaveBeenCalled();
  });
});
