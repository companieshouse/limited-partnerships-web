import request from "supertest";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../../test/utils/locales";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import { getServiceTitle } from "../../utils";

type PostcodeRegisteredOfficeAddressTestConfig = {
  url: string;
  redirectUrl: string;
  confirmRedirectUrl: string;
  translateExclude: string[];
  translateRegisteredOfficeAddressExclude: string[];
  serviceTitleTranslationKey: string | { serviceName: string };
};

export const runPostcodeRegisteredOfficeAddressTests = (config: PostcodeRegisteredOfficeAddressTestConfig): void => {
  describe("Postcode Registered Office Address Page", () => {
    const URL = getUrl(config.url);
    const REDIRECT_URL = getUrl(config.redirectUrl);

    beforeEach(() => {
      setLocalesEnabled(false);

      appDevDependencies.cacheRepository.feedCache(null);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
    });

    describe("Get Postcode Registered Office Address Page", () => {
      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should load the office address page - %s", async (lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${translationText.address.findPostcode.registeredOfficeAddress.whatIsOfficeAddress} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
        );
        testTranslations(res.text, translationText.address.findPostcode, config.translateExclude);
        testTranslations(res.text, translationText.address.registeredOffice, config.translateRegisteredOfficeAddressExclude);
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
          [APPLICATION_CACHE_KEY]: {
            [appDevDependencies.transactionGateway.transactionId]: {
              roa_postcode: "ST6 3LJ"
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

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl)}`);

        expect(appDevDependencies.cacheRepository.cache).toEqual({
          [APPLICATION_CACHE_KEY]: {
            [appDevDependencies.transactionGateway.transactionId]: {
              roa_postcode: "ST6 3LJ",
              registered_office_address: {
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

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl)}`);
      });

      it("should validate the post code and find a matching address - premises and postcode lowercase", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodeRegisteredOfficeAddress,
          premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise.toLowerCase(),
          postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode.toLowerCase()
        });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl)}`);
      });

      it("should return an error if the postcode is not valid", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.postcodeRegisteredOfficeAddress,
          premises: null,
          postal_code: "AA1 1AA"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.postcodeLookup.postcodeNotFound);

        expect(appDevDependencies.cacheRepository.cache).toEqual(null);
      });
    });
  });

};
