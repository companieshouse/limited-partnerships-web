import request from "supertest";

import * as config from "../../../../../config/constants";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../config/dev-dependencies";
import app from "../../app";

import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";
import AddressPageType from "../../../../controller/addressLookUp/PageType";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";

describe("Postcode Registered Office Address Page", () => {
  const URL = getUrl(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
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
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "correspondenceAddress",
        "errorMessages",
        "newRequirement"
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
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "correspondenceAddress",
        "errorMessages",
        "newRequirement"
      ]);
    });
  });

  describe("Post postcode", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [config.APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["registered_office_address"]: {
              postal_code: "ST6 3LJ",
              address_line_1: "",
              address_line_2: "",
              locality: "",
              country: "",
              premises: ""
            }
          }
        }
      });
    });

    it("should validate the post code and find a matching address then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      const REDIRECT_URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [config.APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["registered_office_address"]: {
              postal_code: "ST6 3LJ",
              premises: "2",
              address_line_1: "DUNCALF STREET",
              address_line_2: "",
              locality: "STOKE-ON-TRENT",
              country: "England"
            }
          }
        }
      });
    });

    it("should validate the post code and find a matching address - premises and postcode uppercase", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise.toUpperCase(),
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode.toUpperCase()
      });

      const REDIRECT_URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should validate the post code and find a matching address - premises and postcode lowercase", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise.toLowerCase(),
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode.toLowerCase()
      });

      const REDIRECT_URL = getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
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
  });
});
