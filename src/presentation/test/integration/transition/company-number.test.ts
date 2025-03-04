import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { COMPANY_NUMBER_URL } from "presentation/controller/transition/url";

describe("Company number page", () => {
  const URL = getUrl(COMPANY_NUMBER_URL);

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
