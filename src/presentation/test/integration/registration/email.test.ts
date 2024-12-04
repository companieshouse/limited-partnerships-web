import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { EMAIL_URL } from "../../../controller/registration/Routing";

describe("Name Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the name page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(EMAIL_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.emailPage.title);
    expect(res.text).toContain(enTranslationText.emailPage.whatIsEmail);
    expect(res.text).toContain(enTranslationText.emailPage.emailHint);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the name page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(EMAIL_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.emailPage.title);
    expect(res.text).toContain(cyTranslationText.emailPage.whatIsEmail);
    expect(res.text).toContain(cyTranslationText.emailPage.emailHint);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });
});
