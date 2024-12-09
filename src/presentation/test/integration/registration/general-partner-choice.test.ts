import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  GENERAL_PARTNER_CHOICE_URL,
} from "../../../controller/registration/Routing";

describe("General Partner Choice Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the general partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(GENERAL_PARTNER_CHOICE_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.generalPartnerChoicePage.title);
  });

  it("should load the general partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(GENERAL_PARTNER_CHOICE_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.generalPartnerChoicePage.title);
  });
});
