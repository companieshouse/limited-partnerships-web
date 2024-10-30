import request from "supertest";
import * as config from "../../src/config";
import enStartPageText from "../../locales/en/translations.json";
import cyStartPageText from "../../locales/cy/translations.json";
import app from "../../src/app";
import { LocalesService } from "@companieshouse/ch-node-utils";

describe("Localisation tests", () => {

  test("renders the start page with English text when lang is en", async () => {
    LocalesService.getInstance().enabled = true;

    const resp = await request(app).get(config.START_URL + "?lang=en");

    expect(resp.text).toContain(enStartPageText.startTitle);
  });

  test("renders the start page with Welsh text when lang is cy", async () => {
    LocalesService.getInstance().enabled = true;

    const resp = await request(app).get(config.START_URL + "?lang=cy");

    expect(resp.text).toContain(cyStartPageText.startTitle);
  });

  test("renders the start page with English text when an unsupported language is given", async () => {
    LocalesService.getInstance().enabled = true;

    const resp = await request(app).get(config.START_URL + "?lang=pp");

    expect(resp.text).toContain(enStartPageText.startTitle);
  });

  test("renders the start page with English text when an unsupported language is given", async () => {
    LocalesService.getInstance().enabled = true;

    const resp = await request(app).get(config.START_URL + "?lang=pp");

    expect(resp.text).toContain(enStartPageText.startTitle);
  });

  test("renders the start page with English text as default when localisation is switched on", async () => {
    LocalesService.getInstance().enabled = true;

    const resp = await request(app).get(config.START_URL);

    expect(resp.text).toContain(enStartPageText.startTitle);
  });

  test("renders the start page with English text as default when localisation is switched off", async () => {
    LocalesService.getInstance().enabled = false;

    const resp = await request(app).get(config.START_URL);

    expect(resp.text).toContain(enStartPageText.startTitle);
  });

  test("renders the start page with the language nav bar when localisation is switched on", async () => {
    LocalesService.getInstance().enabled = true;

    const resp = await request(app).get(config.START_URL);

    expect(resp.text).toContain("English");
    expect(resp.text).toContain("Cymraeg");
  });

  test("renders the start page without the language nav bar when localisation is switched off", async () => {
    LocalesService.getInstance().enabled = false;

    const resp = await request(app).get(config.START_URL);

    expect(resp.text).not.toContain("English");
    expect(resp.text).not.toContain("Cymraeg");
  });

});
