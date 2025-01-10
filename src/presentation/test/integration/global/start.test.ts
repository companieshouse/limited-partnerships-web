import request from "supertest";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { START_URL } from "../../../controller/global/Routing";

describe("Create Transaction", () => {
  beforeAll(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors();
  });

  it("should load the start page with status 200", async () => {
    const res = await request(app).get(START_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain("This is Limited Partnerships");
  });
});
