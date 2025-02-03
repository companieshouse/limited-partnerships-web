import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "presentation/test/utils";
import AddressPageType from "presentation/controller/addressLookUp/PageType";

describe("Enter Registered Office Address Page", () => {
  const URL = getUrl(ENTER_REGISTERED_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
  });

  describe("GET Enter Registered Office Address Page", () => {
    it("should load the enter registered office address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.enterRegisteredOfficeAddressPage);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the enter registered office address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.enterRegisteredOfficeAddressPage);
    });
  });

  describe("POST Enter Registered Office Address Page", () => {
    it("should redirect to the confirm address page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterRegisteredOfficeAddress
      });

      const redirectUrl = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the error page when error occurs during Post", async () => {
      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});
