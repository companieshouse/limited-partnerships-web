import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { CHOOSE_REGISTERED_OFFICE_ADDRESS_URL } from "presentation/controller/addressLookUp/url";
import { setLocalesEnabled } from "../../../../test/test-utils";
import { appDevDependencies } from "config/dev-dependencies";
import * as config from "config";

describe("Choose Registered Office Address Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
        {
          postcode: "ST6 3LJ",
          premise: "",
          addressLine1: "",
          addressLine2: "",
          postTown: "",
          country: ""
        }
    });
  });

  it("should load the choose registered office address page with English text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.chooseRegisteredOfficeAddressPage.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.chooseRegisteredOfficeAddressPage.title);
    expect(res.text).toContain(enTranslationText.chooseRegisteredOfficeAddressPage.addressLink);

    expect(res.text).toContain(enTranslationText.buttons.continue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the choose registered office address page with Welsh text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.chooseRegisteredOfficeAddressPage.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(cyTranslationText.chooseRegisteredOfficeAddressPage.title);
    expect(res.text).toContain(enTranslationText.chooseRegisteredOfficeAddressPage.addressLink);

    expect(res.text).toContain(cyTranslationText.buttons.continue);
  });

  it("should populate the address list", async () => {
    setLocalesEnabled(false);

    const res = await request(app).get(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain("2 Duncalf street, Stoke-on-trent, ST6 3LJ");
    expect(res.text).toContain("4 Duncalf street, Stoke-on-trent, ST6 3LJ");
    expect(res.text).toContain("6 Duncalf street, Stoke-on-trent, ST6 3LJ");
  });
});
