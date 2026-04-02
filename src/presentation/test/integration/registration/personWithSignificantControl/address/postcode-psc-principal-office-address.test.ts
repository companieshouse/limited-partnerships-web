import request from "supertest";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import app from "../../../app";
import {
  getUrl,
  setLocalesEnabled,
  toEscapedHtml,
  testTranslations,
  createPersonWithSignificantControl
} from "../../../../utils";

import {
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/registration";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";

import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

describe("Postcode person with significant control's principal office address page", () => {
  const URL_RELEVANT_LEGAL_ENTITY = getUrl(
    POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
  );
  const URL_OTHER_REGISTARBLE_PERSON = getUrl(
    POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
  );

  beforeEach(() => {
    setLocalesEnabled(true);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withJurisdiction(Jurisdiction.SCOTLAND)
      .build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  describe("Get postcode person with significant control's principal office address page for %s", () => {
    it.each([
      ["RLE English", URL_RELEVANT_LEGAL_ENTITY, "en", enTranslationText],
      ["RLE Welsh", URL_RELEVANT_LEGAL_ENTITY, "cy", cyTranslationText],
      ["ORP English", URL_OTHER_REGISTARBLE_PERSON, "en", enTranslationText],
      ["ORP Welsh", URL_OTHER_REGISTARBLE_PERSON, "cy", cyTranslationText]
    ])(
      "should load the principal office address page with English text",
      async (_description: string, URL: string, lang: string, translationText: Record<string, any>) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          toEscapedHtml(
            translationText.address.findPostcode.personWithSignificantControl.principalOfficeAddress
              .whatIsPrincipalOfficeAddress
          ) + ` - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.address.findPostcode, [
          "registeredOfficeAddress",
          "principalPlaceOfBusiness",
          "usualResidentialAddress",
          "correspondenceAddress",
          "errorMessages",
          "limitedPartner",
          "generalPartner"
        ]);

        expect(res.text).toContain(personWithSignificantControl.data.legal_entity_name?.toUpperCase());
      }
    );
  });

  describe("Post postcode person with significant control's principal office address page", () => {
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
      "should validate the post code then redirect to the next page for %s",
      async (_description: string, URL: string, pageType: string, REDIRECT_URL) => {
        const res = await request(app).post(URL).send({
          pageType,
          premises: null,
          postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

        expect(appDevDependencies.cacheRepository.cache).toEqual({
          [APPLICATION_CACHE_KEY]: {
            [appDevDependencies.transactionGateway.transactionId]: {
              ["principal_office_address"]: {
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
      }
    );

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
      "should validate the post code then redirect to the next page even if LP jurisdiction is not in the same locality for %s",
      async (_description: string, URL: string, pageType: string, REDIRECT_URL) => {
        const res = await request(app).post(URL).send({
          pageType,
          premises: null,
          postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
      }
    );

    it.each([
      [
        "RLE",
        URL_RELEVANT_LEGAL_ENTITY,
        AddressPageType.postcodePersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress
      ],
      [
        "ORP",
        URL_OTHER_REGISTARBLE_PERSON,
        AddressPageType.postcodePersonWithSignificantControlOtherRegistrablePersonPrincipalOfficeAddress
      ]
    ])(
      "should return an error if the postcode is not valid for %s",
      async (_description: string, URL: string, pageType: string) => {
        const personWithSignificantControl = createPersonWithSignificantControl(URL, URL_RELEVANT_LEGAL_ENTITY);

        const res = await request(app).post(URL).send({
          pageType,
          premises: null,
          postal_code: "AA1 1AA"
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);
        expect(res.text).toContain(personWithSignificantControl?.data?.legal_entity_name?.toUpperCase());
      }
    );
  });
});
