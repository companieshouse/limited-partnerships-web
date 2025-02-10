import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "presentation/controller/addressLookUp/url";
import { GENERAL_PARTNERS_URL } from "../../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { appDevDependencies } from "config/dev-dependencies";
import * as config from "config";
import AddressPageType from "presentation/controller/addressLookUp/PageType";

describe("Choose Principal Place Of Business Address Page", () => {
  const URL = getUrl(CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);
  const REDIRECT_URL = getUrl(GENERAL_PARTNERS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.addressLookUpGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache({
      [`${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}principal_place_of_business`]:
        {
          postal_code: "ST6 3LJ",
          premises: "",
          address_line_1: "",
          address_line_2: "",
          locality: "",
          country: ""
        }
    });
  });

  describe("GET Choose Principal Place Of Business Address Page", () => {
    it("should load the choose principal place of business address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(
        res.text,
        cyTranslationText.choosePrincipalPlaceOfBusinessPage
      );
    });

    it("should load the choose principal place of business address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(
        res.text,
        enTranslationText.choosePrincipalPlaceOfBusinessPage
      );
    });

    it("should populate the address list", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("2 Duncalf street, Stoke-on-trent, ST6 3LJ");
      expect(res.text).toContain(
        "The lodge Duncalf street, Castle hill, Stoke-on-trent, ST6 3LJ"
      );
      expect(res.text).toContain("4 Duncalf street, Stoke-on-trent, ST6 3LJ");
      expect(res.text).toContain("6 Duncalf street, Stoke-on-trent, ST6 3LJ");
    });

    it("should return error page when gateway getListOfValidPostcodeAddresses throws an error", async () => {
      appDevDependencies.addressLookUpGateway.setError(true);

      const res = await request(app).get(URL);

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });

  describe("POST Choose Principal Place Of Business Page", () => {
    it("should redirect to the next page and add select address to cache", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.choosePrincipalPlaceOfBusinessAddress,
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

      // Will need to be uncommented when the confirm page is introduced
      /* const cache = appDevDependencies.cacheRepository.cache;
      expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).toHaveProperty(
        `${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}principal_place_of_business_address`,
          {
            postal_code: "ST6 3LJ",
            premises: "4",
            address_line_1: "DUNCALF STREET",
            address_line_2: "",
            locality: "STOKE-ON-TRENT",
            country: "GB-ENG"
          }
        ); */
    });

    it("should redirect to the error page if address can't be deserialised", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.choosePrincipalPlaceOfBusinessAddress,
        selected_address: `some address`
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);

      const cache = appDevDependencies.cacheRepository.cache;
      expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).not.toHaveProperty(
        `${config.APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${AddressPageType.choosePrincipalPlaceOfBusinessAddress}`
      );
    });
  });
});
