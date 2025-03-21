import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";

import * as config from "config";
import { ENTER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../../controller/addressLookUp/url";
import { LIMITED_PARTNERS_URL } from "../../../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity,
  generalPartnerPerson
} from "../../../../builder/GeneralPartnerBuilder";
import { ApiErrors } from "../../../../../../domain/entities/UIErrors";

describe("Enter Usual Residential Address Page", () => {
  const URL = getUrl(ENTER_USUAL_RESIDENTIAL_ADDRESS_URL);
  const redirectUrl = getUrl(LIMITED_PARTNERS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("GET Enter general partners usual residential address", () => {
    it("should load enter general partners usual residential address page with english text", async () => {
      setLocalesEnabled(true);
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "postcodeLength",

      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain(generalPartner.data?.forename?.toUpperCase());
      expect(res.text).toContain(generalPartner.data?.surname?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load enter general partners usual residential address manual entry page with welsh text", async () => {
      setLocalesEnabled(true);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "postcodeLength",
        "postcode"
      ]);
      expect(res.text).toContain(generalPartner.data?.legal_entity_name?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.forename?.toUpperCase());
    });

    it("should load enter general partners usual residential address manual entry page with overseas back link", async () => {
      appDevDependencies.cacheRepository.feedCache({ territory_choice: "overseas" });
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          "territory_choice": "overseas"
        }
      });

      const res = await request(app).get(URL);
      expect(res.status).toBe(200);

      expect(res.text).toContain('/general-partner-usual-residential-address-territory-choice');

    });

    it("should load enter general partners usual residential address manual entry page with postcode lookup back link", async () => {
      appDevDependencies.cacheRepository.feedCache({ territory_choice: "overseas" });
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          "territory_choice": "unitedKingdom"
        }
      });

      const res = await request(app).get(URL);
      expect(res.status).toBe(200);

      expect(res.text).toContain('/postcode-usual-residential-address');

    });
  });

  describe("POST Enter general partners usual residential address Page", () => {
    it("should redirect and add entered address to the cache", async () => {
      appDevDependencies.addressLookUpGateway.setError(false);
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ["usual_residential_address"]: {
            address_line_1: "",
            address_line_2: "",
            country: "",
            locality: "",
            postal_code: "",
            premises: "",
            region: ""
          }
        }
      });
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterUsualResidentialAddress,
          postal_code: "",
          premises: "4",
          address_line_1: "DUNCALF STREET",
          address_line_2: "",
          locality: "STOKE-ON-TRENT",
          country: "GB-ENG",
        });
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);

      const cache = appDevDependencies.cacheRepository.cache;
      expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).toEqual({
        [appDevDependencies.transactionGateway.transactionId]: {
          usual_residential_address: {
            postal_code: "",
            premises: "4",
            address_line_1: "DUNCALF STREET",
            address_line_2: "",
            locality: "STOKE-ON-TRENT",
            country: "GB-ENG",
            region: undefined
          }
        }
      });
    });

    it("should redirect to the confirm general partners usual residential address page", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterUsualResidentialAddress,
        addressLine1: ""
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the error page when error occurs during Post", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: ""
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should redirect if postcode is null", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const apiErrors: ApiErrors = {
        errors: {
          "usualResidentialAddress.postalCode": "must not be null"
        }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmRegisteredOfficeAddress,
        address: `{"postal_code": "","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "GB-ENG"}`
      });

      expect(res.status).toBe(302);
      expect(res.text).not.toContain("must not be null");
    });
  });
});
