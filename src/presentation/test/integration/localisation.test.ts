import request from "supertest";

import app from "./app";
import enTranslationText from "../../../../locales/en/translations.json";
import cyTranslationText from "../../../../locales/cy/translations.json";
import { setLocalesEnabled } from "../utils";
import { PARTNERSHIP_TYPE_URL } from "../../../presentation/controller/registration/url";

describe("Localisation tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the start page with English text when lang is en", async () => {
    setLocalesEnabled(true);

    const resp = await request(app).get(PARTNERSHIP_TYPE_URL + "?lang=en");

    expect(resp.text).toContain(enTranslationText.partnershipTypePage.title);
  });

  test("renders the start page with Welsh text when lang is cy", async () => {
    setLocalesEnabled(true);

    const resp = await request(app).get(PARTNERSHIP_TYPE_URL + "?lang=cy");

    expect(resp.text).toContain(cyTranslationText.partnershipTypePage.title);
  });

  test("renders the start page with English text when an unsupported language is given", async () => {
    setLocalesEnabled(true);

    const resp = await request(app).get(PARTNERSHIP_TYPE_URL + "?lang=pp");

    expect(resp.text).toContain(enTranslationText.partnershipTypePage.title);
  });

  test("renders the start page with English text as default when localisation is switched on", async () => {
    setLocalesEnabled(true);

    const resp = await request(app).get(PARTNERSHIP_TYPE_URL);

    expect(resp.text).toContain(enTranslationText.partnershipTypePage.title);
    expect(resp.text).toContain("English");
    expect(resp.text).toContain("Cymraeg");
  });

  test("renders the start page with English text as default when localisation is switched off", async () => {
    setLocalesEnabled(false);

    const resp = await request(app).get(PARTNERSHIP_TYPE_URL);

    expect(resp.text).toContain(enTranslationText.partnershipTypePage.title);
    expect(resp.text).not.toContain("English");
    expect(resp.text).not.toContain("Cymraeg");
  });
});
