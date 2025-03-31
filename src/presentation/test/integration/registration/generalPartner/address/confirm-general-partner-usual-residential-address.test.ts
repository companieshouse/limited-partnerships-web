import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import { CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL, POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../../controller/addressLookUp/url";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { ApiErrors } from "../../../../../../domain/entities/UIErrors";
import GeneralPartnerBuilder from "../../../../builder/GeneralPartnerBuilder";

describe("Confirm General Partner Usual Residential Address Page", () => {
  const URL = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        ["usual_residential_address"]: {
          postal_code: "ST6 3LJ",
          premises: "4",
          address_line_1: "line 1",
          address_line_2: "line 2",
          locality: "stoke-on-trent",
          region: "region",
          country: "GB-ENG"
        }
      }
    });

    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("GET Confirm Usual Residential Address Page", () => {
    it("should load the confirm usual residential address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.confirm.usualResidentialAddress);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain("England");
      expect(res.text).toContain("ST6 3LJ");
    });

    it("should load the confirm usual residential address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.confirm.usualResidentialAddress);

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain("England");
      expect(res.text).toContain("ST6 3LJ");
    });
  });

  describe("POST Confirm Usual Residential Address Page", () => {
    it("should redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
        address: `{
        "postal_code": "ST6 3LJ",
        "premises": "4",
        "address_line_1": "DUNCALF STREET",
        "address_line_2": "",
        "locality": "STOKE-ON-TRENT",
        "country": "GB-ENG"
        }`
      });

      const redirectUrl = getUrl(POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL); // TODO change to next page when ready
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    });

    it("should show validation error message if validation error occurs when saving address", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const apiErrors: ApiErrors = {
        errors: {
          "usualResidentialAddress.country": "must not be null"
        }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("must not be null");
    });
  });
});
