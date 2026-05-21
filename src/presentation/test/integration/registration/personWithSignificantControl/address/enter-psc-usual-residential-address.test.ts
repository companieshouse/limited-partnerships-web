import request from "supertest";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enGeneralTranslationText from "../../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../../locales/cy/address.json";
import enErrorsTranslationText from "../../../../../../../locales/en/errors.json";
import cyErrorsTranslationText from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import {
  countOccurrences,
  getUrl,
  setLocalesEnabled,
  testTranslations
} from "../../../../utils";

import {
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/registration";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import TransactionPersonWithSignificantControl from "../../../../../../domain/entities/TransactionPersonWithSignificantControl";
import PersonWithSignificantControlBuilder from "../../../../builder/PersonWithSignificantControlBuilder";

describe("Enter person with significant control's usual residential address manual address page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };

  const URL = getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL);

  const pageType = AddressPageType.enterPersonWithSignificantControlIndividualPersonUsualResidentialAddress;

  let personWithSignificantControl: TransactionPersonWithSignificantControl;

  beforeEach(() => {
    setLocalesEnabled(true);

    personWithSignificantControl = new PersonWithSignificantControlBuilder()
      .isIndividualPerson()
      .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
      .build();

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withJurisdiction(Jurisdiction.SCOTLAND)
      .build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get enter person with significant control's usual residential address page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load enter person with significant controls usual residential address page with %s",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);

        testTranslations(res.text, translationText.address.enterAddress, [
          "registeredOfficeAddress",
          "principalPlaceOfBusinessAddress",
          "jurisdictionCountry",
          "postcodeMissing",
          "correspondenceAddress",
          "generalPartner",
          "limitedPartner",
          "principalOfficeAddress",
          "errorMessages"
        ]);

        expect(res.text).toContain(
          [
            personWithSignificantControl?.data?.forename,
            personWithSignificantControl?.data?.middle_names,
            personWithSignificantControl?.data?.surname
          ].join(' ').toUpperCase()
        );
      }
    );

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText],
    ])(
      "should load enter person with significant controls usual residential address page with %s errors",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        const errorMessages = translationText.errorMessages.address.enterAddress;

        appDevDependencies.cacheRepository.feedCache({
          [appDevDependencies.transactionGateway.transactionId]: {
            usual_residential_address: {
              postal_code: "ST6 3LJ",
              premises: "4",
              address_line_1: null,
              address_line_2: "line 2",
              locality: "stoke-on-trent",
              region: "region",
              country: null
            }
          }
        });

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(errorMessages.addressLine1Missing);
        expect(countOccurrences(res.text, errorMessages.addressLine1Missing)).toBe(2);

        expect(res.text).toContain(errorMessages.countryMissing);
        expect(countOccurrences(res.text, errorMessages.countryMissing)).toBe(3);

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

  describe("Post enter usual residential address page", () => {
    it("should not return a validation error when an overseas address and postcode does not conform to UK format", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType,
          ...personWithSignificantControl.data?.usual_residential_address,
          postal_code: "GG1 1GG",
          country: "City"
        });

      expect(res.status).toBe(302);

      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    }
    );

    it("should return a validation error when a UK address and postcode format is invalid", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType,
          ...personWithSignificantControl.data?.usual_residential_address,
          postal_code: "here"
        });

      expect(res.status).toBe(200);

      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.postcodeFormat);
      expect(res.text).toContain(enTranslationText.govUk.error.title);

      expect(res.text).toContain(
        [
          personWithSignificantControl?.data?.forename,
          personWithSignificantControl?.data?.middle_names,
          personWithSignificantControl?.data?.surname
        ].join(' ').toUpperCase()
      );
    }
    );

    it("should not return validation errors when address fields contain valid but non alpha-numeric characters", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType,
          ...personWithSignificantControl.data?.usual_residential_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      expect(res.status).toBe(302);

      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    }
    );

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText],
    ])("should return %s validation errors when address fields contain invalid characters", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app)
        .post(URL + `?lang=${lang}`)
        .send({
          pageType,
          ...personWithSignificantControl.data?.usual_residential_address,
          premises: "±",
          address_line_1: "±",
          address_line_2: "±",
          locality: "±",
          region: "±"
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.premisesInvalid);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.addressLine1Invalid);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.addressLine2Invalid);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.localityInvalid);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.regionInvalid);
      expect(res.text).toContain(translationText.govUk.error.title);
      expect(res.text).toContain(
        [
          personWithSignificantControl?.data?.forename,
          personWithSignificantControl?.data?.middle_names,
          personWithSignificantControl?.data?.surname
        ].join(' ').toUpperCase()
      );
    }
    );

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText],
    ])("should return %s validation errors when address fields exceed character limit", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app)
        .post(URL + `?lang=${lang}`)
        .send({
          pageType,
          ...personWithSignificantControl.data?.usual_residential_address,
          premises: "toomanycharacters".repeat(13),
          address_line_1: "toomanycharacters".repeat(4),
          address_line_2: "toomanycharacters".repeat(4),
          locality: "toomanycharacters".repeat(4),
          region: "toomanycharacters".repeat(4)
        });

      expect(res.status).toBe(200);

      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.premisesLength);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.addressLine1Length);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.addressLine2Length);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.localityLength);
      expect(res.text).toContain(translationText.errorMessages.address.enterAddress.regionLength);
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
});
