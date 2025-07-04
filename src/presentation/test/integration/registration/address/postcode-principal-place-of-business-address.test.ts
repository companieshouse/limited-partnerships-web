import request from "supertest";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../config/dev-dependencies";
import app from "../../app";

import {
  POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import AddressPageType from "../../../../controller/addressLookUp/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../../config/constants";

describe("Postcode Principal Place Of Business Address Page", () => {
  const URL = getUrl(POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
  const addresses: UKAddress[] = appDevDependencies.addressLookUpGateway.englandAddresses;

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  describe("Get Postcode Principal Place Of Business Address Page", () => {
    it("should load the page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.address.findPostcode.principalPlaceOfBusiness.whatIsPrincipalPlaceOfBusiness} - ${enTranslationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "correspondenceAddress",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.address.findPostcode.principalPlaceOfBusiness.whatIsPrincipalPlaceOfBusiness} - ${cyTranslationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "correspondenceAddress",
        "errorMessages"
      ]);
    });
  });

  describe("Post postcode", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
        premises: null,
        postal_code: addresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["principal_place_of_business_address"]: {
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
        pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
        premises: addresses[0].premise,
        postal_code: addresses[0].postcode
      });

      const REDIRECT_URL = getUrl(CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["principal_place_of_business_address"]: {
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

    it("should return an error if the postcode is not valid", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
        premises: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });

    describe("UK mainland postcode", () => {
      it("should return an error if the postcode is from Jersey", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
          premises: null,
          postal_code: "JE2 3AA"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(`Enter a UK mainland postcode`);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });

      it("should return an error if the postcode is from Guernsey", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
          premises: null,
          postal_code: "GY1 2AL"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(`Enter a UK mainland postcode`);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });

      it("should return an error if the postcode is from Isle of man", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
          premises: null,
          postal_code: "IM2 4NN"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(`Enter a UK mainland postcode`);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });
    });
  });
});
