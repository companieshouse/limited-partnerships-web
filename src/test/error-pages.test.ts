import request from "supertest";

import app from "../app";
import * as config from "../config";

import { get } from "../controllers/start.controller";
import { CsrfError } from "@companieshouse/web-security-node";

jest.mock("../controllers/start.controller");
const mockGet = get as jest.Mock;

const CSRF_TOKEN_ERROR = "CSRF token mismatch";
const CSRF_ERROR_PAGE_TEXT = "We have not been able to save the information you submitted on the previous screen.";
const CSRF_ERROR_PAGE_HEADING = "Sorry, something went wrong";

describe("Error pages", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 'page-not-found' page", async () => {
    const response = await request(app).get(config.START_URL + "/wrong-url");

    expect(response.status).toEqual(404);
    expect(response.text).toContain("Page not found");
    expect(response.text).toContain(config.START_URL);
  });

  it("should render the 'error-page' page", async () => {
    mockGet.mockImplementationOnce(() => { throw new Error("Error 500"); });

    const response = await request(app).get(config.START_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, the service is unavailable");
  });

  it("Should render the CSRF error page", async () => {
    mockGet.mockImplementationOnce(() => { throw new CsrfError(CSRF_TOKEN_ERROR); });

    const response = await request(app).get(config.START_URL);

    expect(response.status).toEqual(403);
    expect(response.text).toContain(CSRF_ERROR_PAGE_HEADING);
    expect(response.text).toContain(CSRF_ERROR_PAGE_TEXT);
  });
});
