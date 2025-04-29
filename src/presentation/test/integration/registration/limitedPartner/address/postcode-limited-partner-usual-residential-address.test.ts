import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import app from "../../../app";

import { getUrl, setLocalesEnabled, toEscapedHtml, testTranslations } from "../../../../utils";
import LimitedPartnerBuilder, {
  limitedPartnerLegalEntity,
  limitedPartnerPerson
} from "../../../../builder/LimitedPartnerBuilder";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import {
  POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import { CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/registration/url";

describe("Postcode Usual Residential Address Page", () => {
  const URL = getUrl(POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHECK_YOUR_ANSWERS_URL); // TODO change to choose url

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);

    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
  });

  describe("Get Postcode Usual Residential Address Page", () => {
    it("should load the usual residential address page with English text", async () => {
      setLocalesEnabled(true);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(enTranslationText.address.findPostcode.limitedPartner.usualResidentialAddress.whatIsUsualResidentialAddress) +
          ` - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "principalOfficeAddress",
        "correspondenceAddress",
        "generalPartner",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain(limitedPartner.data?.forename?.toUpperCase());
      expect(res.text).toContain(limitedPartner.data?.surname?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load the usual residential address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        toEscapedHtml(cyTranslationText.address.findPostcode.limitedPartner.usualResidentialAddress.whatIsUsualResidentialAddress) +
          ` - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "principalOfficeAddress",
        "correspondenceAddress",
        "generalPartner",
        "errorMessages"
      ]);
      expect(res.text).toContain(limitedPartner.data?.legal_entity_name?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerPerson.forename?.toUpperCase());
    });
  });

  describe("Post postcode", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["usual_residential_address_limited_partner"]: {
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
        pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
        premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      const REDIRECT_URL = getUrl(CHECK_YOUR_ANSWERS_URL); // TODO Change to confirm page url

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["usual_residential_address_limited_partner"]: {
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
        pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
        premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise.toUpperCase(),
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode.toUpperCase()
      });

      const REDIRECT_URL = getUrl(CHECK_YOUR_ANSWERS_URL); // TODO Change to confirm url

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should validate the post code and find a matching address - premises and postcode lowercase", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
        premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise.toLowerCase(),
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode.toLowerCase()
      });

      const REDIRECT_URL = getUrl(CHECK_YOUR_ANSWERS_URL); // TODO Change to confirm url

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return an error if the postcode is not valid", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .withForename("Dai")
        .withSurname("Jones")
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
        premises: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);
      expect(res.text).toContain(`${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});
