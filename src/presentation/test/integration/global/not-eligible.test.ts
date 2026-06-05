import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { NOT_ELIGIBLE_URL } from "../../../controller/global/url";
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
    const res = await request(app).get(`${NAME_URL}?lang=${lang}`);

    expect(res.status).toBe(403);
    expect(res.text).toContain(translationText.notEligiblePage.title);

    const resGeneralPartners = await request(app).get(`${GENERAL_PARTNERS_URL}?lang=${lang}`);

    expect(resGeneralPartners.status).toBe(403);
    expect(resGeneralPartners.text).toContain(translationText.notEligiblePage.title);

    const resLimitedPartners = await request(app).get(`${LIMITED_PARTNERS_URL}?lang=${lang}`);

    expect(resLimitedPartners.status).toBe(403);
    expect(resLimitedPartners.text).toContain(translationText.notEligiblePage.title);

    const resTellUsAboutPsc = await request(app).get(`${TELL_US_ABOUT_PSC_URL}?lang=${lang}`);

    expect(resTellUsAboutPsc.status).toBe(403);
    expect(resTellUsAboutPsc.text).toContain(translationText.notEligiblePage.title);

    const resCheckYourAnswers = await request(app).get(`${CHECK_YOUR_ANSWERS_URL}?lang=${lang}`);

    expect(resCheckYourAnswers.status).toBe(403);
    expect(resCheckYourAnswers.text).toContain(translationText.notEligiblePage.title);
  });
});
