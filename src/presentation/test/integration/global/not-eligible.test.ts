import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import * as webSecurityNode from "@companieshouse/web-security-node";

import { HEALTHCHECK_URL, NOT_ELIGIBLE_URL, SIGN_OUT_URL, RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL, RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL, RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL, RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL } from "../../../controller/global/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { CHECK_YOUR_ANSWERS_URL, GENERAL_PARTNERS_URL, LIMITED_PARTNERS_URL, NAME_URL, TELL_US_ABOUT_PSC_URL } from "../../../controller/registration/url";
import {
  COMPANY_NUMBER_URL as TRANSITION_COMPANY_NUMBER_URL,
  CONTINUE_SAVED_FILING_URL as TRANSITION_CONTINUE_SAVED_FILING_URL,
  GENERAL_PARTNERS_URL as TRANSITION_GENERAL_PARTNERS_URL,
  LIMITED_PARTNERS_URL as TRANSITION_LIMITED_PARTNERS_URL,
  CHECK_YOUR_ANSWERS_URL as TRANSITION_CHECK_YOUR_ANSWERS_URL,
  TRANSITION_START_URL
} from "../../../controller/transition/url";
import {
  COMPANY_NUMBER_URL as POST_TRANSITION_COMPANY_NUMBER_URL,
  LANDING_PAGE_URL as POST_TRANSITION_LANDING_PAGE_URL,
  GENERAL_PARTNER_CHOICE_URL as POST_TRANSITION_GENERAL_PARTNER_CHOICE_URL,
  LIMITED_PARTNER_CHOICE_URL as POST_TRANSITION_LIMITED_PARTNER_CHOICE_URL
} from "../../../controller/postTransition/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";

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
    [NAME_URL, "en", enTranslationText],
    ["/limited-partnerships/Registration/partner-name", "en", enTranslationText],
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
    "/limited-partnerships/transaction/123/submission/123/Resume",
    RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL,
    RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL,
    RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL,
    RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL
  ])("should block resume route %s", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(403);
    expect(res.text).toContain(enTranslationText.notEligiblePage.title);
  });

  it.each([
    TRANSITION_START_URL,
    "/limited-partnerships/Transition/company-number",
    getUrl(TRANSITION_COMPANY_NUMBER_URL),
    getUrl(TRANSITION_GENERAL_PARTNERS_URL),
    getUrl(TRANSITION_LIMITED_PARTNERS_URL),
    getUrl(TRANSITION_CHECK_YOUR_ANSWERS_URL)
  ])("should block transition route %s", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(403);
    expect(res.text).toContain(enTranslationText.notEligiblePage.title);
  });

  it.each([
    POST_TRANSITION_COMPANY_NUMBER_URL,
    "/limited-partnerships/Update/company-number",
    getUrl(POST_TRANSITION_LANDING_PAGE_URL),
    getUrl(POST_TRANSITION_GENERAL_PARTNER_CHOICE_URL),
    getUrl(POST_TRANSITION_LIMITED_PARTNER_CHOICE_URL)
  ])("should block post-transition route %s", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(403);
    expect(res.text).toContain(enTranslationText.notEligiblePage.title);
  });

  it("should block an unrecognised service route", async () => {
    const res = await request(app).get("/limited-partnerships/some-random-page");
    expect(res.status).toBe(403);
    expect(res.text).toContain(enTranslationText.notEligiblePage.title);
  });

  it("should not block the healthcheck route", async () => {
    const res = await request(app).get(HEALTHCHECK_URL);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "OK" });
  });

  it("should not block the sign-out page", async () => {
    const res = await request(app).get(`${getUrl(SIGN_OUT_URL)}?lang=en`);
    expect(res.status).toBe(200);
    expect(res.text).not.toContain(enTranslationText.notEligiblePage.title);
    testTranslations(res.text, enTranslationText.signOutPage);
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
    expect(res.text).not.toContain(enTranslationText.notEligiblePage.title);
  });
});

describe("Valid ACSP User - Transition", () => {
  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

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
    [getUrl(TRANSITION_GENERAL_PARTNERS_URL), "en"],
    [getUrl(TRANSITION_LIMITED_PARTNERS_URL), "en"],
    [getUrl(TRANSITION_GENERAL_PARTNERS_URL), "cy"],
    [getUrl(TRANSITION_LIMITED_PARTNERS_URL), "cy"]
  ])("should allow valid ACSP user to access transition route %s - %s", async (url, lang) => {
    const res = await request(app).get(`${url}?lang=${lang}`);
    expect(res.status).toBe(200);
    expect(res.text).not.toContain(enTranslationText.notEligiblePage.title);
    // confirm the ACSP middleware actually fired for the transition route (allowed, not skipped)
    expect(jest.mocked(webSecurityNode.acspManageUsersAuthMiddleware)).toHaveBeenCalled();
  });

  it("should allow valid ACSP user to reach the transition start page", async () => {
    const res = await request(app).get(TRANSITION_START_URL);
    expect(res.status).toBe(302);
    expect(res.header.location).toContain(TRANSITION_CONTINUE_SAVED_FILING_URL);
    expect(res.text).not.toContain(enTranslationText.notEligiblePage.title);
    expect(jest.mocked(webSecurityNode.acspManageUsersAuthMiddleware)).toHaveBeenCalled();
  });
});

describe("Valid ACSP User - Post Transition", () => {
  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.companyGateway.feedCompanyProfile(new CompanyProfileBuilder().build().data);

    const mocked = jest.mocked(webSecurityNode.acspManageUsersAuthMiddleware);
    mocked.mockImplementation(() =>
      (req: Request, res: Response, next: NextFunction) => next()
    );
  });

  afterEach(() => {
    const mocked = jest.mocked(webSecurityNode.acspManageUsersAuthMiddleware);
    mocked.mockReset();
  });

  it.each(["en", "cy"])(
    "should allow valid ACSP user to access the post-transition company number page - %s",
    async (lang) => {
      const res = await request(app).get(`${getUrl(POST_TRANSITION_COMPANY_NUMBER_URL)}?lang=${lang}`);
      expect(res.status).toBe(200);
      expect(res.text).not.toContain(enTranslationText.notEligiblePage.title);
      expect(jest.mocked(webSecurityNode.acspManageUsersAuthMiddleware)).toHaveBeenCalled();
    }
  );
});
