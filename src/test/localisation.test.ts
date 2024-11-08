import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";

import app from "../app";
import * as config from "../config";
import enStartPageText from "../../locales/en/translations.json";
import cyStartPageText from "../../locales/cy/translations.json";

jest.mock("../middlewares/authentication.middleware", () => ({
  authentication: (req: Request, res: Response, next: NextFunction) => next()
}));

describe("Localisation tests", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, 'isLocalesEnabled').mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  test("renders the start page with English text when lang is en", async () => {
    setLocalesEnabled(true);

    const resp = await request(app).get(config.START_URL + "?lang=en");

    expect(resp.text).toContain(enStartPageText.startTitle);
  });

  test("renders the start page with Welsh text when lang is cy", async () => {
    setLocalesEnabled(true);

    const resp = await request(app).get(config.START_URL + "?lang=cy");

    expect(resp.text).toContain(cyStartPageText.startTitle);
  });

  test("renders the start page with English text when an unsupported language is given", async () => {
    setLocalesEnabled(true);

    const resp = await request(app).get(config.START_URL + "?lang=pp");

    expect(resp.text).toContain(enStartPageText.startTitle);
  });

  test("renders the start page with English text as default when localisation is switched on", async () => {
    setLocalesEnabled(true);

    const resp = await request(app).get(config.START_URL);

    expect(resp.text).toContain(enStartPageText.startTitle);
    expect(resp.text).toContain("English");
    expect(resp.text).toContain("Cymraeg");
  });

  test("renders the start page with English text as default when localisation is switched off", async () => {
    setLocalesEnabled(false);

    const resp = await request(app).get(config.START_URL);

    expect(resp.text).toContain(enStartPageText.startTitle);
    expect(resp.text).not.toContain("English");
    expect(resp.text).not.toContain("Cymraeg");
  });

});
