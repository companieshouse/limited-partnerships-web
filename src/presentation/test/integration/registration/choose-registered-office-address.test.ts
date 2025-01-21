import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { CHOOSE_REGISTERED_OFFICE_ADDRESS_URL } from "presentation/controller/addressLookUp/url";

describe("Choose Registered Office Address Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  describe("Get Choose Registered Office Address Page", () => {
    it("should load the choose registered office address page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.chooseRegisteredOfficeAddressPage.title} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(enTranslationText.chooseRegisteredOfficeAddressPage.title);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
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
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });
  });
});
