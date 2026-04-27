import request from "supertest";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../locales/cy/address.json";
import enErrorsTranslationText from "../../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../../locales/cy/errors.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import {
  POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import AddressPageType from "../../../../controller/addressLookUp/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../../config/constants";

describe("Postcode Principal Place Of Business Address Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
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

    describe("Error messages", () => {
      it("should return an error if the postcode is not valid", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
          premises: null,
          postal_code: "AA1 1AA"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.postcodeLookup.postcodeNotFound);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });

      it("should return an error if the postcode is missing", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
          premises: null,
          postal_code: ""
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.postcodeLookup.postcodeMissing);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });

      it("should return an error if the postcode is invalid", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
          premises: null,
          postal_code: "_____"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.postcodeLookup.postcodeInvalid);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });

      it("should return an error if the postcode is invalid", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
          premises: "_____",
          postal_code: "AA1 1AA"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.postcodeLookup.premisesInvalid);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });

      it.each([
        [
          enTranslationText.errorMessages.address.enterAddress.jurisdictionEnglandAndWales,
          Jurisdiction.ENGLAND_AND_WALES,
          appDevDependencies.addressLookUpGateway.scotlandAddresses[0].postcode
        ],
        [
          enTranslationText.errorMessages.address.enterAddress.jurisdictionScotland,
          Jurisdiction.SCOTLAND,
          appDevDependencies.addressLookUpGateway.walesAddresses[0].postcode
        ],
        [
          enTranslationText.errorMessages.address.enterAddress.jurisdictionNorthernIreland,
          Jurisdiction.NORTHERN_IRELAND,
          appDevDependencies.addressLookUpGateway.walesAddresses[0].postcode
        ]
      ])("%s", async (errorMessage: string, jurisdiction: string, postcode: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .withJurisdiction(jurisdiction as Jurisdiction)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodeRegisteredOfficeAddress,
          premises: null,
          postal_code: postcode
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(errorMessage);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });
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
