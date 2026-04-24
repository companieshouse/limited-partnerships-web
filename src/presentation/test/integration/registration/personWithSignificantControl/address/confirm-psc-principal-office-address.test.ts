import request from "supertest";

import enGeneralTranslationText from "../../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../../locales/cy/address.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { createPersonWithSignificantControl, getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";

import {
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/registration";
import { REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL } from "../../../../../controller/registration/url";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";

describe("Confirm PSC Principal Office Address Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText };
  const URL_RELEVANT_LEGAL_ENTITY = getUrl(
    CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
  );
  const URL_OTHER_REGISTARBLE_PERSON = getUrl(
    CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
  );

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        principal_office_address: {
          postal_code: "ST6 3LJ",
          premises: "4",
          address_line_1: "line 1",
          address_line_2: "line 2",
          locality: "stoke-on-trent",
          region: "region",
          country: "England"
        }
      }
    });
  });

  describe("GET Confirm PSC Principal Office Address Page", () => {
    it.each([
      ["RLE English", URL_RELEVANT_LEGAL_ENTITY, "en", enTranslationText],
      ["RLE Welsh", URL_RELEVANT_LEGAL_ENTITY, "cy", cyTranslationText],
      ["ORP English", URL_OTHER_REGISTARBLE_PERSON, "en", enTranslationText],
      ["ORP Welsh", URL_OTHER_REGISTARBLE_PERSON, "cy", cyTranslationText]
    ])(
      "should load the confirm PSC principal office address page with %s text",
      async (_description: string, URL: string, lang: string, translationText: Record<string, any>) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        testTranslations(res.text, translationText.address.confirm.personWithSignificantControlPrincipalOfficeAddress);

        expect(res.text).toContain("4 Line 1");
        expect(res.text).toContain("Line 2");
        expect(res.text).toContain("Stoke-On-Trent");
        expect(res.text).toContain("Region");
        expect(res.text).toContain("ST6 3LJ");

        expect(res.text).toContain(personWithSignificantControl.data.legal_entity_name?.toUpperCase());
      }
    );

    it.each([
      [
        "RLE, overseas",
        URL_RELEVANT_LEGAL_ENTITY,
        getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)
      ],
      [
        "RLE unitedKingdom",
        URL_RELEVANT_LEGAL_ENTITY,
        getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)
      ],
      [
        "ORP, overseas",
        URL_OTHER_REGISTARBLE_PERSON,
        getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL)
      ],
      [
        "ORP unitedKingdom",
        URL_OTHER_REGISTARBLE_PERSON,
        getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL)
      ]
    ])(
      "should have the correct back link for territory for %s",
      async (territory: string, URL: string, backLink: string) => {
        appDevDependencies.cacheRepository.feedCache({
          [appDevDependencies.transactionGateway.transactionId]: {
            poa_territory_choice: territory
          }
        });

        const res = await request(app).get(URL);

        expect(res.text).toContain(backLink);
      }
    );
  });

  describe("POST Confirm PSC Principal Office Address Page", () => {
    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.confirmPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.confirmPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress
      ]
    ])("should redirect to the next page for %s", async (_description: string, URL: string, pageType: string) => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      const redirectUrl = getUrl(REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.confirmPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.confirmPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress
      ]
    ])(
      "should show error message if address is not provided for %s",
      async (_description: string, URL: string, pageType: string) => {
        appDevDependencies.cacheRepository.feedCache({});

        const res = await request(app).post(URL).send({
          pageType
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain("You must provide an address");
      }
    );

    it.each([
      [
        "RLE en",
        "en",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.confirmPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
        enErrorMessages
      ],
      [
        "RLE cy",
        "cy",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.confirmPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
        cyErrorMessages
      ],
      [
        "ORP en",
        "en",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.confirmPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress,
        enErrorMessages
      ],
      [
        "ORP cy",
        "cy",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.confirmPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress,
        cyErrorMessages
      ]
    ])(
      "should show validation error message if country is missing with lang %s",
      async (_description: string, lang: string, URL: string, pageType: string, errorMessagesJson: any) => {
        setLocalesEnabled(true);
        const res = await request(app).post(`${URL}?lang=${lang}`).send({
          pageType,
          address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(errorMessagesJson.errorMessages.address.confirm.countryMissing);
      }
    );
  });
});
