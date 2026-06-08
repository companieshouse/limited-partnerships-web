import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { NOT_ELIGIBLE_URL, RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL, RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL, RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL, RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL } from "../../../controller/global/url";
import { setLocalesEnabled, testTranslations } from "../../utils";
import { CHECK_YOUR_ANSWERS_URL, GENERAL_PARTNERS_URL, LIMITED_PARTNERS_URL, NAME_URL, TELL_US_ABOUT_PSC_URL } from "../../../controller/registration/url";

jest.mock("@companieshouse/web-security-node", () => {
  const actual = jest.requireActual("@companieshouse/web-security-node");

  return {
    ...actual,
    CsrfProtectionMiddleware: (_opts: any) => (req: Request, res: Response, next: NextFunction) => next(),
    authMiddleware: () => jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
    acspManageUsersAuthMiddleware: jest.fn(() =>
      (req: Request, res: Response, next: NextFunction) =>
        next(new actual.InvalidAcspNumberError("Acsp Number invalid"))
    )
  };
});

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
    [NAME_URL, "en", enTranslationText],
    [GENERAL_PARTNERS_URL, "en", enTranslationText],
    [LIMITED_PARTNERS_URL, "en", enTranslationText],
    [TELL_US_ABOUT_PSC_URL, "en", enTranslationText],
    [CHECK_YOUR_ANSWERS_URL, "en", enTranslationText],
    [NAME_URL, "cy", cyTranslationText],
    [GENERAL_PARTNERS_URL, "cy", cyTranslationText],
    [LIMITED_PARTNERS_URL, "cy", cyTranslationText],
    [TELL_US_ABOUT_PSC_URL, "cy", cyTranslationText],
    [CHECK_YOUR_ANSWERS_URL, "cy", cyTranslationText]
  ])("should block registration route %s - %s", async (url, lang, translationText) => {
    const res = await request(app).get(`${url}?lang=${lang}`);
    expect(res.status).toBe(403);
    expect(res.text).toContain(translationText.notEligiblePage.title);
  });

  it.each([
    RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL,
    RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL,
    RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL,
    RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL
  ])("should block resume route %s", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(403);
    expect(res.text).toContain(enTranslationText.notEligiblePage.title);
  });
});
