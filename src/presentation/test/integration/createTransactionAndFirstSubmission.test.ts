import request from "supertest";
import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "./app";
import { appDevDependencies } from "../../../config";
import {
  NAME_URL,
  registrationRoutingName,
} from "../../../application/registration/Routing";

describe("Create transaction and the first submission", () => {
  beforeAll(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
  });

  it("should load the start page with status 200", async () => {
    const url = appDevDependencies.registrationController.inserTransactionId(
      NAME_URL,
      appDevDependencies.registrationGateway.transactionId
    );

    const res = await request(app).get(url);

    expect(res.status).toBe(200);
    expect(res.text).toContain("What's the name of the limited partnership?");
  });

  it("should create a transaction and the first submission", async () => {
    const url = appDevDependencies.registrationController.inserSubmissionId(
      appDevDependencies.registrationController.inserTransactionId(
        NAME_URL,
        appDevDependencies.registrationGateway.transactionId
      ),
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

  // Only for demo - to be removed
  it("should create a submission and go to next 2", async () => {
    const url = appDevDependencies.registrationController.inserSubmissionId(
      appDevDependencies.registrationController.inserTransactionId(
        NAME_URL,
        appDevDependencies.registrationGateway.transactionId
      ),
      appDevDependencies.registrationGateway.submissionId
    );

    const res = await request(app).post(url).send({
      pageType: registrationRoutingName.pageType,
      partnership_name: "Test Limited Partnership",
      name_ending: NameEndingType.LP,
    });

    const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/${appDevDependencies.registrationGateway.submissionId}/next-2`;

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
  });

  it("should return an error", async () => {
    const url = appDevDependencies.registrationController.inserSubmissionId(
      appDevDependencies.registrationController.inserTransactionId(
        NAME_URL,
        appDevDependencies.registrationGateway.transactionId
      ),
      appDevDependencies.registrationGateway.submissionId
    );

    const res = await request(app).post(url).send({
      pageType: registrationRoutingName.pageType,
    });

    expect(res.status).toBe(200);
    // see when and where to display errors from the API
  });
});
