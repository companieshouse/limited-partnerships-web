import request from "supertest";
import app from "../app";
import { CHECK_YOUR_ANSWERS_URL } from "../../../controller/registration/url";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

describe("Check Your Answers Page", () => {
  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);

  it("should GET Check Your Answers Page English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    testTranslations(res.text, enTranslationText.checkYourAnswersPage);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should GET Check Your Answers Page Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    testTranslations(res.text, cyTranslationText.checkYourAnswersPage);
    expect(res.text).toContain("WELSH -");
  });

  it("should load the check your answers page with data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(limitedPartnership?.data?.partnership_name?.toUpperCase());
    expect(res.text).toContain(limitedPartnership?.data?.name_ending?.toUpperCase());
    expect(res.text).toContain(limitedPartnership?.data?.email);
    expect(res.text).toContain(limitedPartnership?.data?.jurisdiction);
    expect(res.text).toContain("name#partnership_name");
    expect(res.text).toContain("email#email");
  });
});
