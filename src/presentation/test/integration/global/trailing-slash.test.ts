import request from "supertest";

import app from "../app";
import { HEALTHCHECK_URL } from "../../../controller/global/url";

describe("Trailing slash handling", () => {
  it("should redirect URLs with trailing slashes to URLs without", async () => {
    const response = await request(app).get(`${HEALTHCHECK_URL}/`);
    expect(response.status).toBe(301);
    expect(response.headers.location).toBe(HEALTHCHECK_URL);
  });

  it("should preserve query parameters when redirecting", async () => {
    const response = await request(app).get(`${HEALTHCHECK_URL}/?foo=bar`);
    expect(response.status).toBe(301);
    expect(response.headers.location).toBe(`${HEALTHCHECK_URL}?foo=bar`);
  });

  it("should not redirect the root path", async () => {
    const response = await request(app).get("/");
    expect(response.status).not.toBe(301);
  });
});
