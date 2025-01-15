import { expect, jest, test } from "@jest/globals";
import request from "supertest";
import app from "./app";
import { WHICH_TYPE_URL } from "../../controller/registration/url";
import * as configConstants from "../../../config/constants";
import enTranslationText from "../../../../locales/en/translations.json";
import { HEALTHCHECK_URL } from "../../controller/global/Routing";

const SERVICE_UNAVAILABLE_TEXT = "Sorry, the service is unavailable";

describe("Service Availability tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setServiceUnavailable = (value: boolean) => {
    jest.replaceProperty(
      configConstants,
      "SHOW_SERVICE_UNAVAILABLE_PAGE",
      value
    );
  };

  test("shows the servce unavailable page when service unavailable flag is true", async () => {
    setServiceUnavailable(true);

    const resp = await request(app).get(WHICH_TYPE_URL);

    expect(resp.text).toContain(SERVICE_UNAVAILABLE_TEXT);
  });

  test("does not show the servce unavailable page when service unavailable flag is false", async () => {
    setServiceUnavailable(false);

    const resp = await request(app).get(WHICH_TYPE_URL);

    expect(resp.text).toContain(enTranslationText.whichTypePage.title);
  });

  test("allows the healthcheck to run when service unavailable flag is true", async () => {
    setServiceUnavailable(true);

    const resp = await request(app).get(HEALTHCHECK_URL);

    expect(resp.body).toEqual({ status: "OK" });
  });
});
