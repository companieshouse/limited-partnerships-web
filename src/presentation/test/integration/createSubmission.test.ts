import request from "supertest";

import app from "./app";
import { appDevDependencies } from "../../../config";
import { NAME_URL } from "../../../application/registration/Routing";

describe("Create Transaction", () => {
  beforeAll(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
  });

  it("should load the start page with status 200", async () => {
    const url = appDevDependencies.registrationController.inserTransactionId(
      NAME_URL,
      appDevDependencies.registrationGateway.transationId
    );

    const res = await request(app).get(url);

    expect(res.status).toBe(200);
    expect(res.text).toContain("What's the name of the limited partnership?");
  });
});
