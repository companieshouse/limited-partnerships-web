import request from "supertest";
import { Jurisdiction, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, toEscapedHtml, testTranslations, countOccurrences, feedTransactionAndPartner } from "../../../../utils";

import {
  POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/postTransition";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import GeneralPartnerBuilder, {
  generalPartnerPerson,
  generalPartnerLegalEntity
} from "../../../../builder/GeneralPartnerBuilder";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("Postcode general partner's principal office address page", () => {
  const URL = getUrl(POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("Get postcode general partner's principal office address page", () => {
    it.each(
      [
        ["en"],
        ["cy"]
      ]
    )("should load the principal office address page with %s text", async (lang: string) => {
      setLocalesEnabled(true);
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      feedTransactionAndPartner(PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          translationText.address.findPostcode.generalPartner.principalOfficeAddress.whatIsPrincipalOfficeAddress
        ) + ` - ${toEscapedHtml(translationText.serviceName.addGeneralPartner)} - GOV.UK`
      );
      testTranslations(res.text, translationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "correspondenceAddress",
        "errorMessages",
        "limitedPartner"
      ]);
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.surname?.toUpperCase());
      expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.addGeneralPartner))).toBe(2);
    });
  });

  describe("Post postcode general partner's principal office address page", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeGeneralPartnerPrincipalOfficeAddress,
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

    it("should validate the post code and find a matching address then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeGeneralPartnerPrincipalOfficeAddress,
        premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      const REDIRECT_URL = getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["principal_office_address"]: {
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

    it("should validate the post code then redirect to the next page even if LP jurisdiction is not in the same locality", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withJurisdiction(Jurisdiction.SCOTLAND)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeGeneralPartnerPrincipalOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return an error if the postcode is not valid", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeGeneralPartnerPrincipalOfficeAddress,
        premises: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);
      expect(res.text).toContain(generalPartner.data?.legal_entity_name?.toUpperCase());

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});
