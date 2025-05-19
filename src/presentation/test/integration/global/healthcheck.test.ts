import request from "supertest";

import app from "../app";
import { HEALTHCHECK_URL } from "../../../controller/global/url";

describe("GET /healthcheck", () => {
  it("should return status OK", async () => {
    const response = await request(app).get(HEALTHCHECK_URL);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "OK" });
  });
});
