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
import { createPersonWithSignificantControl, getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";

import {
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/registration";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

describe("Enter person with significant control's principal office manual address page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
  const URL_RELEVANT_LEGAL_ENTITY = getUrl(
    ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
  );
  const URL_OTHER_REGISTARBLE_PERSON = getUrl(
    ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
  );

  beforeEach(() => {
    setLocalesEnabled(true);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withJurisdiction(Jurisdiction.SCOTLAND)
      .build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get enter person with significant control's principal office address page", () => {
    it.each([
      ["RLE English", URL_RELEVANT_LEGAL_ENTITY, "en", enTranslationText],
      ["RLE Welsh", URL_RELEVANT_LEGAL_ENTITY, "cy", cyTranslationText],
      ["ORP English", URL_OTHER_REGISTARBLE_PERSON, "en", enTranslationText],
      ["ORP Welsh", URL_OTHER_REGISTARBLE_PERSON, "cy", cyTranslationText]
    ])(
      "should load enter person with significant controls principal office address page with English text",
      async (_description: string, URL: string, lang: string, translationText: Record<string, any>) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);

        testTranslations(res.text, translationText.address.enterAddress, [
          "registeredOfficeAddress",
          "principalPlaceOfBusinessAddress",
          "jurisdictionCountry",
          "postcodeMissing",
          "usualResidentialAddress",
          "correspondenceAddress",
          "principalOfficeAddress",
          "errorMessages"
        ]);

        expect(res.text).toContain(personWithSignificantControl?.data?.legal_entity_name?.toUpperCase());
      }
    );
  });

  describe("Post enter person with significant control's principal office address page", () => {
    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.enterPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
        getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.enterPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress,
        getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL)
      ]
    ])(
      "should not return a validation error when an overseas address and postcode does not conform to UK format for %s",
      async (_description: string, URL: string, pageType: string, REDIRECT_URL) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app)
          .post(URL)
          .send({
            pageType,
            ...personWithSignificantControl.data?.principal_office_address,
            postal_code: "GG1 1GG",
            country: "City"
          });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      }
    );

    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.enterPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.enterPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress
      ]
    ])(
      "should return a validation error when a UK address and postcode format is invalid for %s",
      async (_description: string, URL: string, pageType: string) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app)
          .post(URL)
          .send({
            pageType,
            ...personWithSignificantControl.data?.principal_office_address,
            postal_code: "here"
          });

        expect(res.status).toBe(200);

        expect(res.text).toContain(enTranslationText.errorMessages.address.postcodeFormat);
        expect(res.text).toContain(enTranslationText.govUk.error.title);

        expect(res.text).toContain(personWithSignificantControl?.data?.legal_entity_name?.toUpperCase());
      }
    );

    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.enterPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
        getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL)
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.enterPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress,
        getUrl(CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL)
      ]
    ])(
      "should not return validation errors when address fields contain valid but non alpha-numeric characters for %s",
      async (_description: string, URL: string, pageType: string, REDIRECT_URL) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app)
          .post(URL)
          .send({
            pageType,
            ...personWithSignificantControl.data?.principal_office_address,
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
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.enterPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.enterPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress
      ]
    ])(
      "should return validation errors when address fields contain invalid characters for %s",
      async (_description: string, URL: string, pageType: string) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app)
          .post(URL)
          .send({
            pageType,
            ...personWithSignificantControl.data?.principal_office_address,
            premises: "±",
            address_line_1: "±",
            address_line_2: "±",
            locality: "±",
            region: "±"
          });
        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.premisesInvalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.addressLine1Invalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.addressLine2Invalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.localityInvalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.regionInvalid);
        expect(res.text).toContain(enTranslationText.govUk.error.title);
      }
    );

    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.enterPersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.enterPersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress
      ]
    ])(
      "should return validation errors when address fields exceed character limit",
      async (_description: string, URL: string, pageType: string) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app)
          .post(URL)
          .send({
            pageType,
            ...personWithSignificantControl.data?.principal_office_address,
            premises: "toomanycharacters".repeat(13),
            address_line_1: "toomanycharacters".repeat(4),
            address_line_2: "toomanycharacters".repeat(4),
            locality: "toomanycharacters".repeat(4),
            region: "toomanycharacters".repeat(4)
          });

        expect(res.status).toBe(200);

        expect(res.text).toContain(enTranslationText.errorMessages.address.premisesLength);
        expect(res.text).toContain(enTranslationText.errorMessages.address.addressLine1Length);
        expect(res.text).toContain(enTranslationText.errorMessages.address.addressLine2Length);
        expect(res.text).toContain(enTranslationText.errorMessages.address.localityLength);
        expect(res.text).toContain(enTranslationText.errorMessages.address.regionLength);
      }
    );
  });
});
