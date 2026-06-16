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
  getUrl,
  setLocalesEnabled,
  toEscapedHtml,
  testTranslations
} from "../../../../utils";

import {
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL
} from "presentation/controller/addressLookUp/url/registration";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";

import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import TransactionPersonWithSignificantControl from "../../../../../../domain/entities/TransactionPersonWithSignificantControl";
import PersonWithSignificantControlBuilder from "../../../../builder/PersonWithSignificantControlBuilder";

describe("Postcode individual person usual residential address page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };

  const URL = getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL);

  const pageType = AddressPageType.postcodePersonWithSignificantControlIndividualPersonUsualResidentialAddress;

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
  });

  describe("Get postcode individual person usual residential address page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the usual residential address page with %s text",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          toEscapedHtml(
            translationText.address.findPostcode.personWithSignificantControl.usualResidentialAddress
              .whatIsUsualResidentialAddress
          ) + ` - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.address.findPostcode, [
          "registeredOfficeAddress",
          "principalPlaceOfBusiness",
          "principalOfficeAddress",
          "correspondenceAddress",
          "errorMessages",
          "limitedPartner",
          "generalPartner"
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
  });

  describe("Post postcode individual person usual residential address page", () => {
    it("should validate the post code then redirect to the next page", async () => {
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
            ura_postcode: "ST6 3LJ"
          }
        }
      });
    }
    );

    it("should validate the post code then redirect to the next page even if LP jurisdiction is not in the same locality", async () => {
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
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should return an %s error if the postcode is not valid", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app).post(URL + `?lang=${lang}`).send({
        pageType,
        premises: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);

      expect(res.text).toContain(translationText.errorMessages.address.postcodeLookup.postcodeNotFound);
      expect(res.text).toContain(personWithSignificantControl?.data?.legal_entity_name?.toUpperCase());
    }
    );
  });
});
