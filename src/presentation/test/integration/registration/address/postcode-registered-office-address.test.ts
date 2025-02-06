import request from "supertest";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

import * as config from "../../../../../config/constants";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../config/dev-dependencies";
import app from "../../app";

import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url";
import AddressPageType from "../../../../controller/addressLookUp/PageType";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Postcode Registered Office Address Page", () => {
  const URL = getUrl(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL);
  const addresses: UKAddress[] =
    appDevDependencies.addressLookUpGateway.addresses;

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);
  });

  describe("Get Postcode Registered Office Address Page", () => {
    it("should load the office address page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.address.findPostcode.registeredOfficeAddress.whatIsOfficeAddress} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.address.findPostcode, [
        "scotland",
        "principalPlaceOfBusiness"
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the office address page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.address.findPostcode.registeredOfficeAddress.whatIsOfficeAddress} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.address.findPostcode, [
        "scotland",
        "principalPlaceOfBusiness"
      ]);
    });
  });

  describe("Post postcode", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: addresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [config.APPLICATION_CACHE_KEY]: {
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
            {
              postal_code: "ST6 3LJ",
              address_line_1: "",
              address_line_2: "",
              locality: "",
              country: "",
              premises: ""
            }
        }
      });
    });

    it("should validate the post code and find a matching address then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: addresses[0].premise,
        postal_code: addresses[0].postcode
      });

      const REDIRECT_URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [config.APPLICATION_CACHE_KEY]: {
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
            {
              postal_code: "ST6 3LJ",
              premises: "2",
              address_line_1: "DUNCALF STREET",
              address_line_2: "",
              locality: "STOKE-ON-TRENT",
              country: "GB-ENG"
            }
        }
      });
    });

    it("should return an error if the postcode is not valid", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });

    it("should return an error if the postcode is in Scotland and the type is LP", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: "IV18 0JT"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        "You must enter a postcode which is in England, Wales, or Northern Ireland"
      );

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });

    it("should return an error if the postcode is not in Scotland and the type is SLP", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPartnershipType(PartnershipType.SLP)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: "ST6 3LJ"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        "You must enter a postcode which is in Scotland"
      );

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});
