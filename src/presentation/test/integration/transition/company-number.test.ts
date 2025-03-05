import request from "supertest";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { COMPANY_NUMBER_URL } from "presentation/controller/transition/url";
import TransitionPageType from "../../../controller/transition/PageType";

describe("Company number page", () => {
  const URL = getUrl(COMPANY_NUMBER_URL);

  describe("GET company number", () => {
    it("should load company number page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.companyNumber);
      expect(res.text).toContain(
        `${enTranslationText.companyNumber.whatIsPartnershipNumber} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load company number page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.companyNumber);
      expect(res.text).toContain(
        `${cyTranslationText.companyNumber.whatIsPartnershipNumber} - ${cyTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");
    });
  });

  describe("POST company number", () => {
    it("should redirect to confirmation page if company_number is valid", async () => {
      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.companyNumber,
        company_number: "LP123456"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`/next`);
    });
  });
});
