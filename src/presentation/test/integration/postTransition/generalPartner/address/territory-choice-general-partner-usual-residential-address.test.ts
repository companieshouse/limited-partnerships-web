import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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
  ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import {
  ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
} from "../../../../../../presentation/controller/postTransition/url";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, { generalPartnerPerson } from "../../../../builder/GeneralPartnerBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("General Partner Usual Residential Address Territory Choice", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
  const URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withKind(PartnerKind.ADD_GENERAL_PARTNER_PERSON)
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("GET /general-partner-usual-residential-address-choose-territory", () => {
    it.each([
      ["en", PartnerKind.ADD_GENERAL_PARTNER_PERSON, enTranslationText],
      ["en", PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, enTranslationText],
      ["cy", PartnerKind.ADD_GENERAL_PARTNER_PERSON, cyTranslationText],
      ["cy", PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, cyTranslationText]
    ])(
      "should load the general partner usual residential address territory choice page with Welsh text",
      async (langParam: string, partnerKind: PartnerKind, translationText: Record<string, any>) => {
        setLocalesEnabled(true);

        const serviceName = partnerKind === PartnerKind.ADD_GENERAL_PARTNER_PERSON
          ? translationText.serviceName.addGeneralPartner
          : translationText.serviceName.updateGeneralPartnerPerson;

        const transaction = new TransactionBuilder().withKind(partnerKind).build();
        appDevDependencies.transactionGateway.feedTransactions([transaction]);

        const res = await request(app).get(URL + `?lang=${langParam}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          toEscapedHtml(
            `${translationText.address.territoryChoice.generalPartnerUsualResidentialAddress.title} - ${serviceName} - GOV.UK`
          )
        );

        testTranslations(res.text, translationText.address.territoryChoice.generalPartnerUsualResidentialAddress);
        testTranslations(res.text, translationText.address.territories);
        expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);

        expect(res.text).toContain(
          `${generalPartnerPerson.forename.toUpperCase()} ${generalPartnerPerson.surname.toUpperCase()}`
        );
      }
    );

    it.each([
      [
        "update",
        PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
        UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
      ],
      ["add", PartnerKind.ADD_GENERAL_PARTNER_PERSON, ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL]
    ])(
      "should contain the correct back link when on %s general partner person journey",
      async (description: string, partnerKind: PartnerKind, backUrl: string) => {
        const generalPartner = new GeneralPartnerBuilder()
          .isPerson()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .withKind(partnerKind)
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(getUrl(backUrl));
      }
    );
  });

  describe("POST /general-partner-territory-choice", () => {
    it.each([
      ["United Kingdom", "unitedKingdom", POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL],
      ["Overseas", "overseas", ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL]
    ])("should redirect to the correct page based on the territory choice", async (option: string, parameter: string, expectedRedirectUrl: string) => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress,
        parameter: parameter
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(getUrl(expectedRedirectUrl));

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ura_territory_choice: parameter
          }
        }
      });
    });

    it("should show an error message when no selection is made for territory choice", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress
      });

      const errorMessages = enTranslationText.errorMessages.address.territoryChoice;
      const errorMessage = `${errorMessages.noOptionSelectedStart}usual residential address${errorMessages.noOptionSelectedEnd}`;

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, errorMessage)).toBe(2);
      expect(res.text).toContain(
        `${generalPartnerPerson.forename.toUpperCase()} ${generalPartnerPerson.surname.toUpperCase()}`
      );
    });
  });
});
