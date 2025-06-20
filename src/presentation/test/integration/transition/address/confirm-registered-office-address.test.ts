import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../../presentation/test/utils";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/transition";
import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import AddressPageType from "../../../../../presentation/controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../../presentation/test/builder/LimitedPartnershipBuilder";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

describe("Confirm Registered Office Address Page", () => {
  const URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        ["registered_office_address"]: {
          postal_code: "ST6 3LJ",
          premises: "4",
          address_line_1: "line 1",
          address_line_2: "line 2",
          locality: "stoke-on-trent",
          region: "region",
          country: "England"
        }
      }
    });

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withPrincipalPlaceOfBusinessAddress(null)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  describe("GET Confirm Registered Office Address Page", () => {
    it("should load the confirm registered office address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.confirm.registeredOfficeAddress);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain("England");
      expect(res.text).toContain("ST6 3LJ");
    });

    describe("Map Country Code", () => {
      it("should return Wales if country code is Wales", async () => {
        appDevDependencies.cacheRepository.feedCache({
          [appDevDependencies.transactionGateway.transactionId]: {
            ["registered_office_address"]: {
              postal_code: "CF3 0AD",
              premises: "261",
              address_line_1: "OAKLANDS CLOSE",
              address_line_2: "",
              locality: "CARDIFF",
              country: "Wales"
            }
          }
        });

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("Wales");
      });

      it("should return Scotland if country code is Scotland", async () => {
        appDevDependencies.cacheRepository.feedCache({
          [appDevDependencies.transactionGateway.transactionId]: {
            ["registered_office_address"]: {
              postal_code: "IV18 0JT",
              premises: "1",
              address_line_1: "MAIN AVENUE",
              address_line_2: "",
              locality: "INVERGORDON",
              country: "Scotland"
            }
          }
        });

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("Scotland");
      });

      it("should return Northern Ireland if country code is Northern Ireland", async () => {
        appDevDependencies.cacheRepository.feedCache({
          [appDevDependencies.transactionGateway.transactionId]: {
            ["registered_office_address"]: {
              postal_code: "BT12 6QH",
              premises: "11E",
              address_line_1: "GLENMACHAN CLOSE",
              address_line_2: "",
              locality: "BELFAST",
              country: "Northern Ireland"
            }
          }
        });

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("Northern Ireland");
      });
    });

    it("should load the confirm registered office address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.confirm.registeredOfficeAddress);
    });
  });

  describe("POST Confirm Registered Office Address Page", () => {
    it("should redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmRegisteredOfficeAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "England"}`
      });

      expect(res.status).toBe(302);

      // const redirectUrl = getUrl(POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL); // This URL should be updated to the correct next page URL
      // expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to confirm principal place of business if address already saved", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmRegisteredOfficeAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "England"}`
      });

      expect(res.status).toBe(302);

      // const redirectUrl = getUrl(CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL); // This URL should be updated to the correct next page URL
      // expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmRegisteredOfficeAddress
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    });

    it("should show validation error message if validation error occurs when saving address", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const apiErrors: ApiErrors = {
        errors: {
          "registeredOfficeAddress.postalCode": "must not be null"
        }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmRegisteredOfficeAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "England"}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("must not be null");
    });
  });
});
