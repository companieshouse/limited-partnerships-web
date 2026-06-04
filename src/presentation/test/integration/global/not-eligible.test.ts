import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { NOT_ELIGIBLE_URL } from "../../../controller/global/url";
import { setLocalesEnabled, testTranslations } from "../../utils";

describe("Not Eligible Page", () => {
  beforeEach(() => {
    setLocalesEnabled(true);
  });

  describe("GET /not-eligible", () => {
    it.each([
      ["en", enTranslationText],
      ["cy", cyTranslationText]
    ])("should load not eligible page - %s", async (lang, translationText) => {
      const res = await request(app).get(`${NOT_ELIGIBLE_URL}?lang=${lang}`);

      expect(res.status).toBe(200);

      testTranslations(res.text, translationText.notEligiblePage);

      expect(res.text).not.toContain("Back");
    });
  });
});
