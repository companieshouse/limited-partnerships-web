import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { CONFIRM_LIMITED_PARTNERSHIP_URL } from "presentation/controller/transition/url";

describe("Confirm correct limited partnership page", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

  describe("Get confirm limited partnership page", () => {
    it("should load confirm correct limited partnership page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${enTranslationText.confirmLimitedPartnership.title} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load confirm correct limited partnership page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.confirmLimitedPartnership);
      expect(res.text).toContain(
        `${cyTranslationText.confirmLimitedPartnership.title} - ${cyTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");
    });

    // it("should have the correct company name", async() => {
    //   const res = await request(app).get(URL);

    //   expect(res.text).toContain("Name of the company here");
    // });
    // it("should have the correct company number", async() => {
    //   const res = await request(app).get(URL);

    //   expect(res.text).toContain("Company number here");
    // });
    // it("should have the correct incorporation date", async() => {
    //   const res = await request(app).get(URL);

    //   expect(res.text).toContain("Incorporation date here");
    // });

  });
});
