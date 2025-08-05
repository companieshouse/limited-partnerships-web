import request from "supertest";

import app from "../app";
import {
  CONTINUE_SAVED_FILING_URL,
  COMPANY_NUMBER_URL
} from "../../../controller/transition/url";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import TransitionPageType from "../../../controller/transition/PageType";
import {
  SERVICE_NAME_TRANSITION,
  YOUR_FILINGS_URL
} from "../../../../config/constants";
import { setLocalesEnabled, testTranslations } from "../../utils";

describe("Continue Saved Filing Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);
  });

  it("should load the page with English text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(CONTINUE_SAVED_FILING_URL + "?lang=en");

    expect(res.status).toBe(200);
    testTranslations(res.text, enTranslationText.continueSavedFilingPage);
    expect(res.text).toContain(enTranslationText.buttons.continue);
    expect(res.text).toContain(SERVICE_NAME_TRANSITION);
  });

  it("should load the page with Welsh text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(CONTINUE_SAVED_FILING_URL + "?lang=cy");

    expect(res.status).toBe(200);
    testTranslations(res.text, cyTranslationText.continueSavedFilingPage);
    expect(res.text).toContain(cyTranslationText.buttons.continue);
    expect(res.text).toContain(SERVICE_NAME_TRANSITION);
  });

  it("should redirect to company number page", async () => {
    const res = await request(app).post(CONTINUE_SAVED_FILING_URL).send({
      pageType: TransitionPageType.continueSavedFiling,
      continue_saved_filing: "NO"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${COMPANY_NUMBER_URL}`);
  });

  it("should redirect to CHS 'your filings' page", async () => {
    const res = await request(app).post(CONTINUE_SAVED_FILING_URL).send({
      pageType: TransitionPageType.continueSavedFiling,
      continue_saved_filing: "YES"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${YOUR_FILINGS_URL}`);
  });
});
