import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "presentation/controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

describe("Choose Principal Place Of Business Address Page", () => {
  const URL = getUrl(CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);

  beforeEach(() => {
  });

  describe("GET Choose Principal Place Of Business Address Page", () => {
    it("should ", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.choosePrincipalPlaceOfBusinessAddressPage);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should ", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.choosePrincipalPlaceOfBusinessAddressPage);
      expect(res.text).toContain("WELSH -");
    });

  });
});
