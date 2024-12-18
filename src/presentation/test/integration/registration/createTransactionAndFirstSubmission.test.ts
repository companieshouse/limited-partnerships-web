import request from "supertest";
import { Request, Response } from "express";
import {
  NameEndingType,
  PartnershipType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { NAME_URL } from "../../../controller/registration/Routing";
import RegistrationPageType from "../../../controller/registration/PageType";

describe("Create transaction and the first submission", () => {
  beforeAll(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the name page with status 200", async () => {
    appDevDependencies.cacheRepository.feedCache({
      [`registration_${RegistrationPageType.whichType}`]: PartnershipType.LP,
    });

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
      pageType: RegistrationPageType.name,
      partnership_name: "Test Limited Partnership",
      name_ending: NameEndingType.LIMITED_PARTNERSHIP,
      partnership_type: PartnershipType.LP,
    });

    const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/${appDevDependencies.registrationGateway.submissionId}/email`;

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
  });

  it("should return an error", async () => {
    const url = appDevDependencies.registrationController.insertIdsInUrl(
      NAME_URL,
      appDevDependencies.registrationGateway.transactionId,
      appDevDependencies.registrationGateway.submissionId
    );

    const res = await request(app).post(url).send({
      pageType: RegistrationPageType.name,
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
