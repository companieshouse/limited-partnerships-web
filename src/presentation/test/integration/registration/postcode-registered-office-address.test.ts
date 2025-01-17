import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";

import * as config from "../../../../config/constants";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../config/dev-dependencies";
import app from "../app";

import { POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../../../controller/addressLookUp/url";
import AddressPageType from "../../../controller/addressLookUp/PageType";

describe("Postcode Registered Office Address Page", () => {
  const address = appDevDependencies.addressLookUpGateway.address;

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

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
        postal_code: address.postcode
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/general-partners`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [config.APPLICATION_CACHE_KEY]: {
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${AddressPageType.postcodeRegisteredOfficeAddress}`]:
            {
              postcode: "CF14 3UZ",
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
        address_line_1: address.addressLine1,
        postal_code: address.postcode
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/general-partners`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [config.APPLICATION_CACHE_KEY]: {
          [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${AddressPageType.postcodeRegisteredOfficeAddress}`]:
            {
              postcode: "CF14 3UZ",
              addressLine1: "CROWN WAY",
              addressLine2: "",
              postTown: "CARDIFF",
              country: "GB-WLS",
              premise: ""
            }
        }
      });
    });
  });
});
