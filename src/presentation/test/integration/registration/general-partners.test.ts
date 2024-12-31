import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  GENERAL_PARTNERS_URL,
} from "../../../controller/registration/Routing";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";

describe("General Partners Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the general partners page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(GENERAL_PARTNERS_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.generalPartnersPage.title } - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(cyTranslationText.generalPartnersPage.title);
  });

  it("should load the general partners page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(GENERAL_PARTNERS_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.generalPartnersPage.title } - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.generalPartnersPage.title);
  });

  it("should load the partnership name and name ending with data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.registrationGateway.feedLimitedPartnerships([
      limitedPartnership,
    ]);

    const res = await request(app).get(GENERAL_PARTNERS_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name} ${limitedPartnership?.data?.name_ending}`
    );
  });
});
