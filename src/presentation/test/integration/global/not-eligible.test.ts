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
    describe("English", () => {
      it("should load not eligible page", async () => {
        const res = await request(app).get(NOT_ELIGIBLE_URL);

        expect(res.status).toBe(200);

        testTranslations(res.text, enTranslationText.notEligiblePage);

        expect(res.text).not.toContain("Back");
      });
    });

    describe("Welsh", () => {
      it("should load not eligible page", async () => {
        const res = await request(app).get(NOT_ELIGIBLE_URL + "?lang=cy");

        expect(res.status).toBe(200);

        testTranslations(res.text, cyTranslationText.notEligiblePage);

        expect(res.text).not.toContain("Back");
      });
    });
  });
});
