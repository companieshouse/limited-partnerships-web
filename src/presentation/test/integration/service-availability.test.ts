import { expect, jest, test } from "@jest/globals";
import request from "supertest";
import { PARTNERSHIP_TYPE_URL } from "../../controller/registration/url";
import { HEALTHCHECK_URL } from "../../controller/global/url";
import { enTranslationText } from "../../../test/utils/locales";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, the service is unavailable";

describe("Service Availability tests", () => {
  const originalServiceUnavailable = process.env.SHOW_SERVICE_UNAVAILABLE_PAGE;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(() => {
    if (originalServiceUnavailable === undefined) {
      delete process.env.SHOW_SERVICE_UNAVAILABLE_PAGE;
      return;
    }
    process.env.SHOW_SERVICE_UNAVAILABLE_PAGE = originalServiceUnavailable;
  });

  const loadAppWithServiceUnavailable = async (value: boolean) => {
    process.env.SHOW_SERVICE_UNAVAILABLE_PAGE = String(value);
    return (await import("./app")).default;
  };

  test("shows the servce unavailable page when service unavailable flag is true", async () => {
    const app = await loadAppWithServiceUnavailable(true);

    const resp = await request(app).get(PARTNERSHIP_TYPE_URL);

    expect(resp.text).toContain(SERVICE_UNAVAILABLE_TEXT);
  });

  test("does not show the servce unavailable page when service unavailable flag is false", async () => {
    const app = await loadAppWithServiceUnavailable(false);

    const resp = await request(app).get(PARTNERSHIP_TYPE_URL);

    expect(resp.text).toContain(enTranslationText.partnershipTypePage.title);
  });

  test("allows the healthcheck to run when service unavailable flag is true", async () => {
    const app = await loadAppWithServiceUnavailable(true);

    const resp = await request(app).get(HEALTHCHECK_URL);

    expect(resp.body).toEqual({ status: "OK" });
  });
});
