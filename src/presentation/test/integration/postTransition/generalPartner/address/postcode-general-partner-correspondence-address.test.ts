import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import app from "../../../app";

import { getUrl, setLocalesEnabled, toEscapedHtml, testTranslations, countOccurrences, feedTransactionAndPartner } from "../../../../utils";
import {
  POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/postTransition";
import GeneralPartnerBuilder, { generalPartnerLegalEntity, generalPartnerPerson } from "../../../../builder/GeneralPartnerBuilder";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Postcode general partner's correspondence address page", () => {
  const URL = getUrl(POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get postcode general partner's correspondence address page", () => {
    it.each(
      [
        ["en"],
        ["cy"]
      ]
    )("should load the correspondence address page with %s text", async (lang: string) => {
      setLocalesEnabled(true);
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      feedTransactionAndPartner(PartnerKind.ADD_GENERAL_PARTNER_PERSON);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          translationText.address.findPostcode.generalPartner.correspondenceAddress.whatIsCorrespondenceAddress
        ) + ` - ${toEscapedHtml(translationText.serviceName.addGeneralPartner)} - GOV.UK`
      );
      testTranslations(res.text, translationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }
      expect(res.text).toContain(generalPartnerPerson.forename?.toUpperCase());
      expect(res.text).toContain(generalPartnerPerson.surname?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
      expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.addGeneralPartner))).toBe(2);
    });
  });

  describe("Post postcode general partner's correspondence address page", () => {
    it("should validate the post code then redirect to the next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeGeneralPartnerCorrespondenceAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            service_address: {
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
        pageType: AddressPageType.postcodeGeneralPartnerCorrespondenceAddress,
        premises: appDevDependencies.addressLookUpGateway.englandAddresses[0].premise,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      const REDIRECT_URL = getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["service_address"]: {
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
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .withForename("Dai")
        .withSurname("Jones")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeGeneralPartnerCorrespondenceAddress,
        premises: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);
      expect(res.text).toContain(
        `${generalPartner.data?.forename?.toUpperCase()} ${generalPartner.data?.surname?.toUpperCase()}`
      );

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});
