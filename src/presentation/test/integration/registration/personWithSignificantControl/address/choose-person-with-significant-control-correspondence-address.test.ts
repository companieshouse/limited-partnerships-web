import request from "supertest";

import enGeneralTranslationText from "../../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../../locales/cy/address.json";
import enErrorsTranslationText from "../../../../../../../locales/en/errors.json";

import app from "../../../app";
import { appDevDependencies } from "config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, countOccurrences } from "../../../../utils";
import * as config from "../../../../../../config";

import {
  CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL,
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL,
} from "presentation/controller/addressLookUp/url/registration";

import AddressPageType from "presentation/controller/addressLookUp/PageType";
import { englandAddressList } from "../../../../../../infrastructure/gateway/addressLookUp/AddressLookUpInMemoryGateway";
import PersonWithSignificantControlBuilder from "../../../../builder/PersonWithSignificantControlBuilder";
import TransactionPersonWithSignificantControl from "../../../../../../domain/entities/TransactionPersonWithSignificantControl";

describe("Choose correspondence address individual person page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText };
  const URL = getUrl(CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL);

  let personWithSignificantControl: TransactionPersonWithSignificantControl;

  beforeEach(() => {
    setLocalesEnabled(true);

    personWithSignificantControl = new PersonWithSignificantControlBuilder()
      .isIndividualPerson()
      .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
      .build();

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

    appDevDependencies.addressLookUpGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        sa_postcode: "ST6 3LJ"
      }
    });

    appDevDependencies.addressLookUpGateway.feedEnglandAddresses(englandAddressList);
  });

  describe("GET choose correspondence address individual person", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText],
    ])(
      "should load the choose correspondence address individual person page with %s text",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        testTranslations(
          res.text,
          translationText.address.chooseAddress.personWithSignificantControlCorrespondenceAddress
        );

        expect(res.text).toContain(
          personWithSignificantControl?.data?.forename?.toUpperCase()
          + " " + personWithSignificantControl?.data?.middle_names?.toUpperCase()
          + " " + personWithSignificantControl?.data?.surname?.toUpperCase()
        );
      }
    );

    it("should populate the address list for %s", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("2 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("The Lodge Duncalf&#39;s Street, Castle Hill, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("4 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("6 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
    });

    it("should redirect to the confirm page if the list contains only one element - %s", async () => {
      // set the gateway to return only one address for the postcode
      appDevDependencies.addressLookUpGateway.feedEnglandAddresses([englandAddressList[0]]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    }
    );

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText],
    ])(
      "should return %s error page when gateway getListOfValidPostcodeAddresses throws an error",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        appDevDependencies.addressLookUpGateway.setError(true);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(500);
        expect(res.text).toContain(translationText.errorPage.title);
      }
    );
  });

  describe("POST choose correspondence address individual person page", () => {
    it("should redirect to the next page and add select address to cache for %s", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.choosePersonWithSignificantControlIndividualPersonCorrespondenceAddress,
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

      expect(appDevDependencies.cacheRepository.cache?.[`${config.APPLICATION_CACHE_KEY}`]).toEqual({
        [appDevDependencies.transactionGateway.transactionId]: {
          sa_postcode: "ST6 3LJ",
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
    }
    );
    it("should trigger GDS validation error when no address is selected for %s", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.choosePersonWithSignificantControlIndividualPersonCorrespondenceAddress,
        });

      const errorMessage = enErrorsTranslationText.errorMessages.address.chooseAddress.selectionRequired;

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, errorMessage)).toBe(2);
    }
    );
  });
});
