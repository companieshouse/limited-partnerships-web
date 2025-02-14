import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../../presentation/test/utils";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL, POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL } from "../../../../../presentation/controller/addressLookUp/url";
import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import * as config from "../../../../../config";
import AddressPageType from "../../../../../presentation/controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../../presentation/test/builder/LimitedPartnershipBuilder";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

describe("Confirm Registered Office Address Page", () => {
  const URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
        {
          postal_code: "ST6 3LJ",
          premises: "4",
          address_line_1: "line 1",
          address_line_2: "line 2",
          locality: "stoke-on-trent",
          region: "region",
          country: "GB-ENG"
        }
    });

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);
  });

  describe("GET Confirm Registered Office Address Page", () => {
    it("should load the confirm registered office address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(
        res.text,
        enTranslationText.confirmRegisteredOfficeAddressPage
      );
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain("England");
      expect(res.text).toContain("ST6 3LJ");
    });

    describe("Map Country Code", () => {
      it("should return Wales if country code is GB-WLS", async () => {
        appDevDependencies.cacheRepository.feedCache({
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
            {
              postal_code: "CF3 0AD",
              premises: "261",
              address_line_1: "OAKLANDS CLOSE",
              address_line_2: "",
              locality: "CARDIFF",
              country: "GB-WLS"
            }
        });

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("Wales");
      });

      it("should return Scotland if country code is GB-SCT", async () => {
        appDevDependencies.cacheRepository.feedCache({
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
            {
              postal_code: "IV18 0JT",
              premises: "1",
              address_line_1: "MAIN AVENUE",
              address_line_2: "",
              locality: "INVERGORDON",
              country: "GB-SCT"
            }
        });

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("Scotland");
      });

      it("should return Northern Ireland if country code is GB-NIR", async () => {
        appDevDependencies.cacheRepository.feedCache({
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
            {
              postal_code: "BT12 6QH",
              premises: "11E",
              address_line_1: "GLENMACHAN CLOSE",
              address_line_2: "",
              locality: "BELFAST",
              country: "GB-NIR"
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
      testTranslations(
        res.text,
        cyTranslationText.confirmRegisteredOfficeAddressPage
      );
    });
  });

  describe("POST Confirm Registered Office Address Page", () => {
    it("should redirect to the next page", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmRegisteredOfficeAddress
        });

      const redirectUrl = getUrl(POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmRegisteredOfficeAddress
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    });

    it("should show validation error message if validation error occurs when saving address", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const apiErrors: ApiErrors = {
        errors: {
          "registeredOfficeAddress.postalCode": "must not be null"
        }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmRegisteredOfficeAddress
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("must not be null");
    });
  });
});
