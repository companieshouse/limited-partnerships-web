import request from "supertest";
import app from "../app";
import { CHECK_YOUR_ANSWERS_URL } from "../../../controller/registration/Routing";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";

describe("Check Your Answers Page", () => {
  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should GET Check Your Answers Page English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(CHECK_YOUR_ANSWERS_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.title);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.lpInfo);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingName);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingSic);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingEmail);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingTerm);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.confirm);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.futureLawful);
    expect(res.text).toContain(enTranslationText.checkYourAnswersPage.payment);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should GET Check Your Answers Page Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(CHECK_YOUR_ANSWERS_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.title);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.lpInfo);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.headingName);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.headingSic);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.headingEmail);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.headingTerm);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.confirm);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.futureLawful);
    expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.payment);
    expect(res.text).toContain("WELSH -");
  });

  it("should load the check your answers page with data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.registrationGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);
    const res = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(limitedPartnership?.data?.partnership_name);
    expect(res.text).toContain(limitedPartnership?.data?.email);
  });
});
