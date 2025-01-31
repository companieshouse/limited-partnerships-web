import request, { Response } from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL, ENTER_REGISTERED_OFFICE_ADDRESS_URL } from "presentation/controller/addressLookUp/url";
import { getUrl, setLocalesEnabled } from "presentation/test/utils";
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
      testTranslations(res, enTranslationText);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the enter registered office address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res, cyTranslationText);
    });

    const toHtml = (input: string) => {
      return input.replace(/'/g, "&#39;");
    };

    const testTranslations = (res: Response, translations: any) => {
      expect(res.text).toContain(
        `${translations.enterRegisteredOfficeAddressPage.title} - ${translations.service} - GOV.UK`
      );
      expect(res.text).toContain(toHtml(translations.enterRegisteredOfficeAddressPage.titleHint1));
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.titleHint2);
      expect(res.text).toContain(toHtml(translations.enterRegisteredOfficeAddressPage.titleHint3));
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.propertyNameOrNumber);
      expect(res.text).toContain(toHtml(translations.enterRegisteredOfficeAddressPage.propertyNameOrNumberHint));
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.addressLine1);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.addressLine2);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.townOrCity);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.county);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.postcode);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.country);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.countrySelect);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.countryEngland);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.countryScotland);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.countryWales);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.countryNorthernIreland);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.publicInformationTitle);
      expect(res.text).toContain(translations.enterRegisteredOfficeAddressPage.publicInformationLine1);
    };
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
