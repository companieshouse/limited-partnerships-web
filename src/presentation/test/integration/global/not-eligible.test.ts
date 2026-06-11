import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import * as webSecurityNode from "@companieshouse/web-security-node";

import { NOT_ELIGIBLE_URL, RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL, RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL, RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL, RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL } from "../../../controller/global/url";
import { setLocalesEnabled, testTranslations } from "../../utils";
import { CHECK_YOUR_ANSWERS_URL, GENERAL_PARTNERS_URL, LIMITED_PARTNERS_URL, NAME_URL, TELL_US_ABOUT_PSC_URL } from "../../../controller/registration/url";

jest.mocked(webSecurityNode.acspManageUsersAuthMiddleware).mockImplementation(() =>
  (req: Request, res: Response, next: NextFunction) =>
    next(new webSecurityNode.InvalidAcspNumberError("Acsp Number invalid"))
);

jest.unmock("../../../../middlewares/acsp-authentication.middleware");

describe("Not Eligible Page", () => {
  beforeEach(() => {
    setLocalesEnabled(true);
  });

  it.each([
    ["en", enTranslationText],
    ["cy", cyTranslationText]
  ])("should load not eligible page - %s", async (lang, translationText) => {
    const res = await request(app).get(`${NOT_ELIGIBLE_URL}?lang=${lang}`);

    expect(res.status).toBe(200);

    testTranslations(res.text, translationText.notEligiblePage);

    expect(res.text).not.toContain("Back");
  });

  it.each([
    [NAME_URL],
    ["/limited-partnerships/Registration/partner-name"],
    [GENERAL_PARTNERS_URL],
    [LIMITED_PARTNERS_URL],
    [TELL_US_ABOUT_PSC_URL],
    [CHECK_YOUR_ANSWERS_URL]
  ])("should block registration route %s", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain(NOT_ELIGIBLE_URL);
  });

  it.each([
    "/limited-partnerships/transaction/123/submission/123/Resume",
    RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL,
    RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL,
    RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL,
    RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL
  ])("should block resume route %s", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain(NOT_ELIGIBLE_URL);
  });
});

describe("Valid ACSP User", () => {
  beforeEach(() => {
    setLocalesEnabled(true);
    const mocked = jest.mocked(webSecurityNode.acspManageUsersAuthMiddleware);
    mocked.mockImplementation(() =>
      (req: Request, res: Response, next: NextFunction) => next()
    );
  });

  afterEach(() => {
    const mocked = jest.mocked(webSecurityNode.acspManageUsersAuthMiddleware);
    mocked.mockReset();
  });

  it.each([
    [NAME_URL, "en"],
    [GENERAL_PARTNERS_URL, "en"],
    [NAME_URL, "cy"],
    [GENERAL_PARTNERS_URL, "cy"]
  ])("should allow valid ACSP user to access registration route %s - %s", async (url, lang) => {
    const res = await request(app).get(`${url}?lang=${lang}`);
    expect(res.status).toBe(200);
    expect(res.headers.location).toBeUndefined();
  });
});
