import request from "supertest";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

import * as config from "../../../../config/constants";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../config/dev-dependencies";
import app from "../app";

import { POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../../../controller/addressLookUp/url";
import AddressPageType from "../../../controller/addressLookUp/PageType";
import { setLocalesEnabled } from "../../../../test/test-utils";

describe("Postcode Registered Office Address Page", () => {
  const addresses: UKAddress[] =
    appDevDependencies.addressLookUpGateway.addresses;

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get Postcode Registered Office Address Page", () => {
    it("should load the office address page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(
        POSTCODE_REGISTERED_OFFICE_ADDRESS_URL + "?lang=en"
      );

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.officeAddress.whatIsOfficeAddress} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(
        enTranslationText.officeAddress.whatIsOfficeAddress
      );
      expect(res.text).toContain(
        enTranslationText.officeAddress.officialCommunication
      );
      expect(res.text).toContain(enTranslationText.officeAddress.findAddress);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the office address page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(
        POSTCODE_REGISTERED_OFFICE_ADDRESS_URL + "?lang=cy"
      );

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.officeAddress.whatIsOfficeAddress} - ${cyTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(
        cyTranslationText.officeAddress.whatIsOfficeAddress
      );
      expect(res.text).toContain(
        cyTranslationText.officeAddress.officialCommunication
      );
      expect(res.text).toContain(cyTranslationText.officeAddress.findAddress);
    });
  });

  describe("Post postcode", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const url = appDevDependencies.addressLookUpController.insertIdsInUrl(
        POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
        appDevDependencies.transactionGateway.transactionId,
        appDevDependencies.limitedPartnershipGateway.submissionId
      );

      const res = await request(app).post(url).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        address_line_1: null,
        postal_code: addresses[0].postcode
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/choose-registered-office-address`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [config.APPLICATION_CACHE_KEY]: {
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
            {
              postcode: "ST6 3LJ",
              addressLine1: "",
              addressLine2: "",
              postTown: "",
              country: "",
              premise: ""
            }
        }
      });
    });

    it("should validate the post code and find a matching address then redirect to the next page", async () => {
      const url = appDevDependencies.addressLookUpController.insertIdsInUrl(
        POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
        appDevDependencies.transactionGateway.transactionId,
        appDevDependencies.limitedPartnershipGateway.submissionId
      );

      const res = await request(app).post(url).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        address_line_1: addresses[0].addressLine1,
        postal_code: addresses[0].postcode
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/choose-registered-office-address`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [config.APPLICATION_CACHE_KEY]: {
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
            {
              postcode: "ST6 3LJ",
              premise: "2",
              addressLine1: "DUNCALF STREET",
              addressLine2: "",
              postTown: "STOKE-ON-TRENT",
              country: "GB-ENG"
            }
        }
      });
    });

    it("should return an error if the postcode is not valid", async () => {
      const url = appDevDependencies.addressLookUpController.insertIdsInUrl(
        POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
        appDevDependencies.transactionGateway.transactionId,
        appDevDependencies.limitedPartnershipGateway.submissionId
      );

      const res = await request(app).post(url).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        address_line_1: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});
