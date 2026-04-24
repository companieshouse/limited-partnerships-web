import request from "supertest";
import { GeneralPartner, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, { generalPartnerPerson } from "../../../../builder/GeneralPartnerBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("General Partner Correspondence Address Territory Choice", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
  const URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const generalPartner: GeneralPartner = new GeneralPartnerBuilder()
      .isPerson()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .withKind(PartnerKind.ADD_GENERAL_PARTNER_PERSON)
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("Get general partner correspondance address territory choice page", () => {
    it.each([
      ["en", PartnerKind.ADD_GENERAL_PARTNER_PERSON, enTranslationText],
      ["en", PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, enTranslationText],
      ["cy", PartnerKind.ADD_GENERAL_PARTNER_PERSON, cyTranslationText],
      ["cy", PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, cyTranslationText]
    ])(
      "should load the general partner correspondence address territory choice page with %s text",
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
            `${translationText.address.territoryChoice.generalPartnerCorrespondenceAddress.title} - ${serviceName} - GOV.UK`
          )
        );

        testTranslations(res.text, translationText.address.territoryChoice.generalPartnerCorrespondenceAddress);
        testTranslations(res.text, translationText.address.territories);
        expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);

        expect(res.text).toContain(
          `${generalPartnerPerson.forename.toUpperCase()} ${generalPartnerPerson.surname.toUpperCase()}`
        );
      }
    );
  });

  describe("Post general partner correspondance address territory choice page", () => {
    it("should redirect to What is the general partner's correspondance address? post code look up page when united kingdom is selected", async () => {
      const UNITED_KINGDOM_PARAMETER = "unitedKingdom";
      const POSTCODE_URL = getUrl(POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
        parameter: UNITED_KINGDOM_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(POSTCODE_URL);
      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            sa_territory_choice: "unitedKingdom"
          }
        }
      });
    });

    it("should redirect to What is the general partner's correspondance address? manual entry page when overseas is selected", async () => {
      const OVERSEAS_PARAMETER = "overseas";
      const MANUAL_ENTRY_URL = getUrl(ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
        parameter: OVERSEAS_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(MANUAL_ENTRY_URL);
      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            sa_territory_choice: "overseas"
          }
        }
      });
    });

    it("should show an error message when no selection is made for territory choice", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress
      });

      const errorMessages = enTranslationText.errorMessages.address.territoryChoice;
      const errorMessage = `${errorMessages.noOptionSelectedStart}service address${errorMessages.noOptionSelectedEnd}`;

      expect(res.status).toBe(200);

      expect(countOccurrences(res.text, errorMessage)).toBe(2);
      expect(res.text).toContain(
        `${generalPartnerPerson.forename.toUpperCase()} ${generalPartnerPerson.surname.toUpperCase()}`
      );
    });
  });
});
