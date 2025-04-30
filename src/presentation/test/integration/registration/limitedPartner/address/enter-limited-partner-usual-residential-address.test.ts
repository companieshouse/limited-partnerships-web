import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";

import * as config from "config";
import {
  // CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import LimitedPartnerBuilder, {
  limitedPartnerLegalEntity,
  limitedPartnerPerson
} from "../../../../builder/LimitedPartnerBuilder";
import { ApiErrors } from "../../../../../../domain/entities/UIErrors";
import { CHECK_YOUR_ANSWERS_URL } from "presentation/controller/registration/url";

describe("Enter Usual Residential Address Page", () => {
  const URL = getUrl(ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
  const redirectUrl = getUrl(CHECK_YOUR_ANSWERS_URL); // TODO Change to confirm address page (CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("GET Enter limited partners usual residential address", () => {
    it("should load enter limited partner's usual residential address page with english text", async () => {
      setLocalesEnabled(true);
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "postcodeLength",
        "postcodeOptional",
        "generalPartner"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain(limitedPartnerPerson.forename?.toUpperCase());
      expect(res.text).toContain(limitedPartnerPerson.surname?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load enter limited partner's usual residential address manual entry page with welsh text", async () => {
      setLocalesEnabled(true);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ura_territory_choice_limited_partner: "overseas"
        }
      });

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "postcodeLength",
        "postcode",
        "generalPartner"
      ]);

      expect(res.text).toContain(limitedPartnerPerson.forename?.toUpperCase());
      expect(res.text).toContain(limitedPartnerPerson.surname?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load enter limited partner's usual residential address manual entry page with overseas back link", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ura_territory_choice_limited_partner: "overseas"
        }
      });

      const redirectUrl = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

      const res = await request(app).get(URL);
      expect(res.status).toBe(200);

      expect(res.text).toContain(redirectUrl);
    });

    it("should load enter limited partner's usual residential address manual entry page with postcode lookup back link", async () => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ura_territory_choice_limited_partner: "unitedKingdom"
        }
      });
      const redirectUrl = getUrl(POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      const res = await request(app).get(URL);
      expect(res.status).toBe(200);

      expect(res.text).toContain(redirectUrl);
    });
  });

  describe("POST Enter limited partner's usual residential address Page", () => {
    it("should redirect and add entered address to the cache", async () => {
      appDevDependencies.addressLookUpGateway.setError(false);
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ["usual_residential_address_limited_partner"]: {
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
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
        postal_code: "",
        premises: "4",
        address_line_1: "DUNCALF STREET",
        address_line_2: "",
        locality: "STOKE-ON-TRENT",
        country: "England"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);

      const cache = appDevDependencies.cacheRepository.cache;
      expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).toEqual({
        [appDevDependencies.transactionGateway.transactionId]: {
          usual_residential_address_limited_partner: {
            postal_code: "",
            premises: "4",
            address_line_1: "DUNCALF STREET",
            address_line_2: "",
            locality: "STOKE-ON-TRENT",
            country: "England",
            region: undefined
          }
        }
      });
    });

    it("should redirect to the confirm limited partner's usual residential address page", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
        addressLine1: "Mill Street"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the error page when error occurs during Post", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: ""
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should redirect if postcode is null", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const apiErrors: ApiErrors = {
        errors: {
          "usualResidentialAddress.postalCode": "must not be null"
        }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmRegisteredOfficeAddress,
        address: `{"postal_code": "","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "England"}`
      });

      expect(res.status).toBe(302);
      expect(res.text).not.toContain("must not be null");
    });
  });
});
