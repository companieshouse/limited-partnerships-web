import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "config/dev-dependencies";
import { createPersonWithSignificantControl, getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import * as config from "../../../../../../config";

import {
  CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/registration";

import AddressPageType from "presentation/controller/addressLookUp/PageType";

describe("Choose principal office address of the person with significant control page", () => {
  const URL_RELEVANT_LEGAL_ENTITY = getUrl(
    CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
  );
  const URL_OTHER_REGISTARBLE_PERSON = getUrl(
    CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
  );

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.addressLookUpGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        ["principal_office_address"]: {
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

  describe("GET choose principal office address of the person with significant control page", () => {
    it.each([
      ["RLE English", URL_RELEVANT_LEGAL_ENTITY, "en", enTranslationText],
      ["RLE Welsh", URL_RELEVANT_LEGAL_ENTITY, "cy", cyTranslationText],
      ["ORP English", URL_OTHER_REGISTARBLE_PERSON, "en", enTranslationText],
      ["ORP Welsh", URL_OTHER_REGISTARBLE_PERSON, "cy", cyTranslationText]
    ])(
      "should load the choose principal office address of the person with significant control page with Welsh text for %s",
      async (_description: string, URL: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        testTranslations(
          res.text,
          translationText.address.chooseAddress.personWithSignificantControlPrincipalOfficeAddress
        );

        console.log(personWithSignificantControl);

        expect(res.text).toContain(personWithSignificantControl.data.legal_entity_name?.toUpperCase());
      }
    );

    it.each([
      ["RLE English", URL_RELEVANT_LEGAL_ENTITY, "en"],
      ["RLE Welsh", URL_RELEVANT_LEGAL_ENTITY, "cy"],
      ["ORP English", URL_OTHER_REGISTARBLE_PERSON, "en"],
      ["ORP Welsh", URL_OTHER_REGISTARBLE_PERSON, "cy"]
    ])("should populate the address list for %s", async (_description: string, URL: string, lang: string) => {
      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain("2 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("The Lodge Duncalf&#39;s Street, Castle Hill, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("4 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
      expect(res.text).toContain("6 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
    });

    it.each([
      ["RLE English", URL_RELEVANT_LEGAL_ENTITY, "en", enTranslationText],
      ["RLE Welsh", URL_RELEVANT_LEGAL_ENTITY, "cy", cyTranslationText],
      ["ORP English", URL_OTHER_REGISTARBLE_PERSON, "en", enTranslationText],
      ["ORP Welsh", URL_OTHER_REGISTARBLE_PERSON, "cy", cyTranslationText]
    ])(
      "should return error page when gateway getListOfValidPostcodeAddresses throws an error for %s",
      async (_description: string, URL: string, lang: string, translationText: Record<string, any>) => {
        appDevDependencies.addressLookUpGateway.setError(true);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(500);
        expect(res.text).toContain(translationText.errorPage.title);
      }
    );
  });

  describe("POST choose principal office address of the person with significant control page", () => {
    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.postcodePersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
        getUrl(CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.postcodePersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress,
        getUrl(CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL)
      ]
    ])(
      "should redirect to the next page and add select address to cache for %s",
      async (_description: string, URL: string, pageType: string, REDIRECT_URL) => {
        const res = await request(app)
          .post(URL)
          .send({
            pageType,
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
            principal_office_address: {
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
  });
});
