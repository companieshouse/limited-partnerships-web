import request from "supertest";

import app from "../app";
import { YOUR_FILINGS_URL } from "../../../../config/constants";
import { setLocalesEnabled, testTranslations } from "../../utils";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";
import { getServiceTitle } from "./utils";

export interface ContinueSavedFilingTestConfig {
  continueUrl: string;
  pageType: string;
  serviceTitleTranslationKey: { serviceName: string } | string;
  noRedirectUrl: string;
  customerFeedbackUrl: string;
}

export function runContinueSavedFilingTests(config: ContinueSavedFilingTestConfig): void {
  const { continueUrl, pageType, serviceTitleTranslationKey, noRedirectUrl, customerFeedbackUrl } = config;

  describe("Continue Saved Filing Page", () => {
    beforeEach(() => {
      setLocalesEnabled(false);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the page with %s text", async (_description, lang, translationText: Record<string, any>) => {
      setLocalesEnabled(true);

      const res = await request(app).get(continueUrl + `?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationText.continueSavedFilingPage);
      expect(res.text).toContain(translationText.buttons.continue);

      expect(res.text).toContain(getServiceTitle(serviceTitleTranslationKey, translationText));

      expect(res.text).toContain(customerFeedbackUrl);
      expect(res.text).not.toContain(translationText.errorMessages.continueSavedFilingPage.selectOption);
    });

    it.each([
      { description: "redirect to the next page", answer: "NO", expectedRedirect: noRedirectUrl },
      { description: "redirect to CHS 'your filings' page", answer: "YES", expectedRedirect: YOUR_FILINGS_URL }
    ])("should $description", async ({ answer, expectedRedirect }) => {
      const res = await request(app).post(continueUrl).send({
        pageType,
        continue_saved_filing: answer
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${expectedRedirect}`);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should re-render the page with an error summary in %s when no option is selected",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);

        const res = await request(app)
          .post(continueUrl + `?lang=${lang}`)
          .send({ pageType });

        expect(res.status).toBe(200);
        expect(res.text).toContain(translationText.errorMessages.continueSavedFilingPage.selectOption);
        expect(res.text).toContain('href="#continue_saved_filing"');
        expect(res.text).toContain(translationText.govUk.error.title);
      }
    );
  });
}
