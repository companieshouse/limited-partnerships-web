import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { NOT_ELIGIBLE_URL, RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL, RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL, RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL, RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL } from "../../../controller/global/url";
import { setLocalesEnabled, testTranslations } from "../../utils";
import { CHECK_YOUR_ANSWERS_URL, GENERAL_PARTNERS_URL, LIMITED_PARTNERS_URL, NAME_URL, TELL_US_ABOUT_PSC_URL } from "../../../controller/registration/url";

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
    ["en", enTranslationText],
    ["cy", cyTranslationText]
  ])("should block registration routes - %s", async (lang, translationText) => {
    const registrationUrls = [
      NAME_URL,
      GENERAL_PARTNERS_URL,
      LIMITED_PARTNERS_URL,
      TELL_US_ABOUT_PSC_URL,
      CHECK_YOUR_ANSWERS_URL
    ];

    for (const url of registrationUrls) {
      const res = await request(app).get(`${url}?lang=${lang}`);
      expect(res.status).toBe(403);
      expect(res.text).toContain(translationText.notEligiblePage.title);
    }
  });

  it("should block resume routes", async () => {
    const resumeUrls = [
      RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL,
      RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL,
      RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL,
      RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL
    ];

    for (const url of resumeUrls) {
      const res = await request(app).get(url);
      expect(res.status).toBe(403);
      expect(res.text).toContain(enTranslationText.notEligiblePage.title);
    }
  });
});
