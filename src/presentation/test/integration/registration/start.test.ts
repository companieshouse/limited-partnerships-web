import request from "supertest";

import app from "../app";
import { CONTINUE_SAVED_FILING_URL, REGISTRATION_START_URL } from "../../../../presentation/controller/registration/url";

describe("Test Registration start url is setup correctly", () => {
  it("should redirect user to CONTINUE_SAVED_FILING page when using the start url", async () => {
    const res = await request(app).get(REGISTRATION_START_URL);
    expect(res.header.location).toContain(CONTINUE_SAVED_FILING_URL);
  });
});
