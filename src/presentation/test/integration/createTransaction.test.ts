import request from "supertest";

import app from "./app";
import { appDevDependencies, START_URL } from "../../../config";
import { registrationRoutingStart } from "../../../application/registration/Routing";

describe("Create Transaction", () => {
  beforeAll(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
  });

  it("should load the start page with status 200", async () => {
    const res = await request(app).get(START_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain("This is Limited Partnerships");
  });

  it("should create a transaction", async () => {
    const res = await request(app).post(START_URL).send({
      transactionType: registrationRoutingStart.transactionType,
    });

    const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/name`;

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
  });
});
