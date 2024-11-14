import request from "supertest";
import { CsrfError } from "@companieshouse/web-security-node";

import app from "../app";
import * as config from "../config";
import { get } from "../controllers/healthcheck.controller";

jest.mock("../controllers/healthcheck.controller");

const mockGet = get as jest.Mock;

describe("Error pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 'page-not-found' page", async () => {
    const response = await request(app).get(
      config.HEALTHCHECK_URL + "/wrong-url"
    );

    expect(response.status).toEqual(404);
    expect(response.text).toContain("Page not found");
  });

  it("should render the 'error-page' page", async () => {
    mockGet.mockImplementationOnce(() => {
      throw new Error("Error 500");
    });

    const response = await request(app).get(config.HEALTHCHECK_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should render the CSRF error page", async () => {
    mockGet.mockImplementationOnce(() => {
      throw new CsrfError("CSRF token mismatch");
    });

    const response = await request(app).get(config.HEALTHCHECK_URL);

    expect(response.status).toEqual(403);
    expect(response.text).toContain("Sorry, something went wrong");
    expect(response.text).toContain(
      "We have not been able to save the information you submitted on the previous screen."
    );
  });
});
