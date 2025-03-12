import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOICE_URL } from "../../../controller/registration/url";
import { appDevDependencies } from "config/dev-dependencies";
import { getUrl } from "presentation/test/utils";

describe("General Partner Usual Residential Address Choice", () => {
  const URL = getUrl(GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOICE_URL);
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the usual residential address for general partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);

    expect(res.text).toContain(
      `${cyTranslationText.generalPartnerUsualResidentialAddressChoicePage.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      cyTranslationText.generalPartnerUsualResidentialAddressChoicePage.title
    );
  });

  it("should load the usual residential address for general partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.generalPartnerUsualResidentialAddressChoicePage.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      enTranslationText.generalPartnerUsualResidentialAddressChoicePage.title
    );
  });
});
