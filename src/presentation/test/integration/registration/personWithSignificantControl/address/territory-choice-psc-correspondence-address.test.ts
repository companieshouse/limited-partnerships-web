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
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/registration";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import PersonWithSignificantControlBuilder from "../../../../builder/PersonWithSignificantControlBuilder";

import TransactionPersonWithSignificantControl from "../../../../../../domain/entities/TransactionPersonWithSignificantControl";

describe("PSC correspondence Address Territory Choice", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };

  const URL = getUrl(TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL);

  const pageType = AddressPageType.territoryChoicePersonWithSignificantControlIndividualPersonCorrespondenceAddress;

  let personWithSignificantControl: TransactionPersonWithSignificantControl;

  beforeEach(() => {
    setLocalesEnabled(true);

    personWithSignificantControl = new PersonWithSignificantControlBuilder()
      .isIndividualPerson()
      .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
      .build();

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  describe("GET PSC correspondence address territory choice", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the PSC correspondence address territory choice page with %s text",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          toEscapedHtml(
            `${translationText.address.territoryChoice.personWithSignificantControlCorrespondenceAddress.title} - ${translationText.serviceRegistration} - GOV.UK`
          )
        );

        testTranslations(
          res.text,
          translationText.address.territoryChoice.personWithSignificantControlCorrespondenceAddress
        );
        testTranslations(res.text, translationText.address.territories);

        expect(res.text).toContain(
          [
            personWithSignificantControl?.data?.forename,
            personWithSignificantControl?.data?.middle_names,
            personWithSignificantControl?.data?.surname
          ].join(' ').toUpperCase()
        );
      }
    );
  });

  describe("POST PSC territory choice", () => {
    it.each([
      [
        "United Kingdom",
        "unitedKingdom",
        getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL)
      ],
      [
        "Overseas",
        "overseas",
        getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_CORRESPONDENCE_ADDRESS_URL)
      ]
    ])(
      "should redirect to postcode lookup page when United Kingdom is selected",
      async (_description: string, territory: string, expectedRedirectUrl: string) => {
        const res = await request(app).post(URL).send({
          pageType,
          parameter: territory
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(expectedRedirectUrl);

        expect(appDevDependencies.cacheRepository.cache).toEqual({
          [APPLICATION_CACHE_KEY]: {
            [appDevDependencies.transactionGateway.transactionId]: {
              ["sa_territory_choice"]: territory
            }
          }
        });
      }
    );

    it("should show an error message when no selection is made for territory choice", async () => {
      const res = await request(app).post(URL).send({
        pageType
      });

      const errorMessages = enTranslationText.errorMessages.address.territoryChoice;
      const errorMessage = `${errorMessages.noOptionSelectedStart}service address${errorMessages.noOptionSelectedEnd}`;

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, errorMessage)).toBe(2);
      expect(res.text).toContain(
        [
          personWithSignificantControl?.data?.forename,
          personWithSignificantControl?.data?.middle_names,
          personWithSignificantControl?.data?.surname
        ].join(' ').toUpperCase()
      );
    });
  });
});

