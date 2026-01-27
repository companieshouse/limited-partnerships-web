import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import {
  CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import * as config from "../../../../../../config";
import AddressPageType from "../../../../../../presentation/controller/addressLookUp/PageType";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Choose general partner correspondence address page", () => {
  const URL = getUrl(CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.addressLookUpGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        service_address: {
          postal_code: "ST6 3LJ",
          premises: "",
          address_line_1: "",
          address_line_2: "",
          locality: "",
          country: ""
        }
      }
    });
  });

  describe("GET choose general partner correspondence address page", () => {
    it.each(
      [
        [PartnerKind.ADD_GENERAL_PARTNER_PERSON, cyTranslationText.serviceName.addGeneralPartner],
        [PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, cyTranslationText.serviceName.updateGeneralPartnerPerson]
      ]
    )("should load the general partner choose correspondence address page with Welsh text", async (partnerKind, serviceName) => {
      setLocalesEnabled(true);

      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.chooseAddress.generalPartnerCorrespondenceAddress);
      expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
    });

    it.each(
      [
        [PartnerKind.ADD_GENERAL_PARTNER_PERSON, enTranslationText.serviceName.addGeneralPartner],
        [PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, enTranslationText.serviceName.updateGeneralPartnerPerson]
      ]
    )("should load the general partner choose correspondence address page with English text", async (partnerKind, serviceName) => {
      setLocalesEnabled(true);

      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.chooseAddress.generalPartnerCorrespondenceAddress);
      expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
    });

    it("should populate the address list", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("2 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("The Lodge Duncalf&#39;s Street, Castle Hill, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("4 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("6 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
    });

    it("should return error page when gateway getListOfValidPostcodeAddresses throws an error", async () => {
      appDevDependencies.addressLookUpGateway.setError(true);

      const res = await request(app).get(URL);

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });

  describe("POST general partner choose correspondence address page", () => {
    it("should redirect to the next page and add select address to cache", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.chooseGeneralPartnerCorrespondenceAddress,
          selected_address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "GB-ENG"
          }`
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      const cache = appDevDependencies.cacheRepository.cache;
      expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).toEqual({
        [appDevDependencies.transactionGateway.transactionId]: {
          service_address: {
            postal_code: "ST6 3LJ",
            premises: "4",
            address_line_1: "DUNCALF STREET",
            address_line_2: "",
            locality: "STOKE-ON-TRENT",
            country: "GB-ENG"
          }
        }
      });
    });

    it("should redirect to the error page if address can't be deserialised", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.chooseGeneralPartnerCorrespondenceAddress,
        selected_address: `some address`
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);

      const cache = appDevDependencies.cacheRepository.cache;
      expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).not.toHaveProperty(
        `${config.APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION}${AddressPageType.chooseGeneralPartnerCorrespondenceAddress}`
      );
    });
  });
});
