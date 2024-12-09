import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  NAME_URL,
} from "../../../controller/registration/Routing";

describe("Name Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the name page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=cy&which-type=registerLp");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.namePage.title);
    expect(res.text).toContain(cyTranslationText.namePage.whatIsName);
    expect(res.text).toContain(cyTranslationText.namePage.nameEnding);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the name page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=en&which-type=registerLp");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.namePage.title);
    expect(res.text).toContain(enTranslationText.namePage.whatIsName);
    expect(res.text).toContain(enTranslationText.namePage.nameEnding);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the private name page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=cy&which-type=registerPflp");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.privateNamePage.title);
    expect(res.text).toContain(cyTranslationText.privateNamePage.nameEnding);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the private name page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=en&which-type=registerPflp");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.privateNamePage.title);
    expect(res.text).toContain(enTranslationText.privateNamePage.nameEnding);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the Scottish limited partnership name page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=cy&which-type=registerSlp");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.scottishNamePage.title);
    expect(res.text).toContain(cyTranslationText.scottishNamePage.nameEnding);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the Scottish limited partnership name page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=en&which-type=registerSlp");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.scottishNamePage.title);
    expect(res.text).toContain(enTranslationText.scottishNamePage.nameEnding);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the private name Scotland page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=cy&which-type=registerPflpSco");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.privateNameScottishPage.title);
    expect(res.text).toContain(cyTranslationText.privateNameScottishPage.whatIsNameHint);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the private name Scotland page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(NAME_URL + "?lang=en&which-type=registerPflpSco");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.privateNameScottishPage.title);
    expect(res.text).toContain(enTranslationText.privateNameScottishPage.whatIsNameHint);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });
});
