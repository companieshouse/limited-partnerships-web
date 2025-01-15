import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { OFFICE_ADDRESS_URL } from "../../../controller/registration/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";

describe("Office Address Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  describe("Get Office Address Page", () => {
    it("should load the office address page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(OFFICE_ADDRESS_URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.officeAddress.whatIsOfficeAddress} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(
        enTranslationText.officeAddress.whatIsOfficeAddress
      );
      expect(res.text).toContain(
        enTranslationText.officeAddress.officialCommunication
      );
      expect(res.text).toContain(enTranslationText.officeAddress.findAddress);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the office address page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(OFFICE_ADDRESS_URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.officeAddress.whatIsOfficeAddress} - ${cyTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(
        cyTranslationText.officeAddress.whatIsOfficeAddress
      );
      expect(res.text).toContain(
        cyTranslationText.officeAddress.officialCommunication
      );
      expect(res.text).toContain(cyTranslationText.officeAddress.findAddress);
    });
  });
});
