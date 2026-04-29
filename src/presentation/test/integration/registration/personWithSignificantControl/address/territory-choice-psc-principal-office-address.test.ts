import request from "supertest";

import enGeneralTranslationText from "../../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../../locales/cy/address.json";
import enErrorsTranslationText from "../../../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";

import {
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/registration";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import PersonWithSignificantControlBuilder from "../../../../builder/PersonWithSignificantControlBuilder";

import { WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL, WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL } from "presentation/controller/registration/url";

describe("PSC Principal Office Address Territory Choice", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
  const URL_RELEVANT_LEGAL_ENTITY = getUrl(
    TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
  );
  const URL_OTHER_REGISTRABLE_PERSON = getUrl(
    TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
  );

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  describe("GET PSC principal office address territory choice", () => {
    it.each([
      ["RLE English", URL_RELEVANT_LEGAL_ENTITY, "en", enTranslationText],
      ["RLE Welsh", URL_RELEVANT_LEGAL_ENTITY, "cy", cyTranslationText],
      ["ORP English", URL_OTHER_REGISTRABLE_PERSON, "en", enTranslationText],
      ["ORP Welsh", URL_OTHER_REGISTRABLE_PERSON, "cy", cyTranslationText]
    ])(
      "should load the PSC principal office address territory choice page with %s text",
      async (_description: string, URL: string, lang: string, translationText: Record<string, any>) => {
        const personWithSignificantControl = buildPSC(_description);
        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          toEscapedHtml(
            `${translationText.address.territoryChoice.personWithSignificantControlPrincipalOfficeAddress.title} - ${translationText.serviceRegistration} - GOV.UK`
          )
        );

        testTranslations(
          res.text,
          translationText.address.territoryChoice.personWithSignificantControlPrincipalOfficeAddress
        );
        testTranslations(res.text, translationText.address.territories);

        expect(res.text).toContain(personWithSignificantControl.data?.legal_entity_name?.toUpperCase());
      }
    );

    it.each([
      ["RLE", URL_RELEVANT_LEGAL_ENTITY, getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL)],
      ["ORP", URL_OTHER_REGISTRABLE_PERSON, getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL)]
    ])(
      "should contain the correct back link for PSC type",
      async (_description: string, URL: string, expectedBackLink: string) => {
        const personWithSignificantControl = buildPSC(_description);
        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(`href="${expectedBackLink}"`);
      }
    );
  });

  describe("POST PSC territory choice", () => {
    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)
      ],
      [
        "ORP",
        URL_OTHER_REGISTRABLE_PERSON,
        getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL)
      ]
    ])(
      "should redirect to postcode lookup page when United Kingdom is selected for %s",
      async (_description: string, URL: string, expectedRedirectUrl: string) => {
        const res = await request(app).post(URL).send({
          pageType:
            AddressPageType.territoryChoicePersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
          parameter: "unitedKingdom"
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(expectedRedirectUrl);

        expect(appDevDependencies.cacheRepository.cache).toEqual({
          [APPLICATION_CACHE_KEY]: {
            [appDevDependencies.transactionGateway.transactionId]: {
              ["poa_territory_choice"]: "unitedKingdom"
            }
          }
        });
      }
    );

    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)
      ],
      [
        "ORP",
        URL_OTHER_REGISTRABLE_PERSON,
        getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL)
      ]
    ])(
      "should redirect to manual entry page when overseas is selected for %s",
      async (_description: string, URL: string, expectedRedirectUrl: string) => {
        const res = await request(app).post(URL).send({
          pageType:
            AddressPageType.territoryChoicePersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
          parameter: "overseas"
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(expectedRedirectUrl);

        expect(appDevDependencies.cacheRepository.cache).toEqual({
          [APPLICATION_CACHE_KEY]: {
            [appDevDependencies.transactionGateway.transactionId]: {
              ["poa_territory_choice"]: "overseas"
            }
          }
        });
      }
    );

    it.each([
      ["RLE", URL_RELEVANT_LEGAL_ENTITY],
      ["ORP", URL_OTHER_REGISTRABLE_PERSON]
    ])("should show an error message when no selection is made for territory choice", async (_description: string, URL: string) => {
      const personWithSignificantControl = buildPSC(_description);
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

      const res = await request(app).post(URL).send({
        pageType:
          AddressPageType.territoryChoicePersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress
      });

      const errorMessages = enTranslationText.errorMessages.address.territoryChoice;
      const errorMessage = `${errorMessages.noOptionSelectedStart}principal office address${errorMessages.noOptionSelectedEnd}`;

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, errorMessage)).toBe(2);
      expect(res.text).toContain(personWithSignificantControl.data?.legal_entity_name?.toUpperCase());
    });
  });
});

const buildPSC = (description: string) => {
  let personWithSignificantControl;
  if (description.includes("RLE")) {
    personWithSignificantControl = new PersonWithSignificantControlBuilder()
      .isRelevantLegalEntity()
      .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
      .build();
  } else {
    personWithSignificantControl = new PersonWithSignificantControlBuilder()
      .isOtherRegistrablePerson()
      .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
      .build();
  }
  return personWithSignificantControl;
};

