import request from "supertest";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import app from "../../../app";

import { getUrl, setLocalesEnabled, toEscapedHtml, testTranslations } from "../../../../utils";
import {
  POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import LimitedPartnerBuilder, {
  limitedPartnerPerson,
  limitedPartnerLegalEntity
} from "../../../../builder/LimitedPartnerBuilder";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

describe("Postcode limited partner's principal office address page", () => {
  const URL = getUrl(POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("Get postcode limited partner's principal office address page", () => {
    it("should load the principal office address page with English text", async () => {
      setLocalesEnabled(true);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(enTranslationText.address.findPostcode.limitedPartner.principalOfficeAddress.whatIsPrincipalOfficeAddress) +
          ` - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "correspondenceAddress",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).not.toContain(limitedPartnerPerson.forename.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerPerson.surname.toUpperCase());
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load the principal office address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(cyTranslationText.address.findPostcode.limitedPartner.principalOfficeAddress.whatIsPrincipalOfficeAddress) +
          ` - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "correspondenceAddress",
        "errorMessages"
      ]);
      expect(res.text).toContain("WELSH -");
      expect(res.text).not.toContain(limitedPartnerPerson.forename.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerPerson.forename.toUpperCase());
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });
  });

  describe("Post postcode limited partner's principal office address page", () => {
    // LP-640 Test ACs 1-3 redirect to choose and confirm once those pages are added.

    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeLimitedPartnerPrincipalOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["principal_office_address"]: {
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

    it("should validate the post code then redirect to the next page even if LP jurisdiction is not in the same locality", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withJurisdiction(Jurisdiction.SCOTLAND)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeLimitedPartnerPrincipalOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return an error if the postcode is not valid", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
        premises: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);
      expect(res.text).toContain(limitedPartner.data?.legal_entity_name?.toUpperCase());

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});
