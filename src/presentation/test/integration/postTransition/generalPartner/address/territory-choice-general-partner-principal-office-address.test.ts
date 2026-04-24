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
  ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, { generalPartnerLegalEntity } from "../../../../builder/GeneralPartnerBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL } from "../../../../../controller/postTransition/url";

describe("General Partner Principal Office Address Territory Choice", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorsTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorsTranslationText };
  const URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isLegalEntity()
      .withKind(PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY)
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("Get general partner principal office address territory choice page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the general partner principal office address territory choice page with %s text",
      async (language: string, langParam: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);
        const backUrl = ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL;

        const res = await request(app).get(URL + `?lang=${langParam}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          toEscapedHtml(
            `${translationText.address.territoryChoice.generalPartnerPrincipalOfficeAddress.title} - ${translationText.serviceName.addGeneralPartner} - GOV.UK`
          )
        );

        testTranslations(res.text, translationText.address.territoryChoice.generalPartnerPrincipalOfficeAddress);
        testTranslations(res.text, translationText.address.territories);

        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.addGeneralPartner))).toBe(2);

        expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name.toUpperCase());
        expect(res.text).toContain(getUrl(backUrl));
      });
  });

  describe("Post general partner principal office address territory choice page", () => {
    it.each([
      ["United Kingdom", "unitedKingdom", POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL],
      ["Overseas", "overseas", ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL]
    ])("should redirect to the correct page based on the territory choice", async (option: string, parameter: string, expectedRedirectUrl: string) => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress,
        parameter: parameter
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(getUrl(expectedRedirectUrl));

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            poa_territory_choice: parameter
          }
        }
      });
    });

    it("should show an error message when no selection is made for territory choice", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress
      });

      const errorMessages = enTranslationText.errorMessages.address.territoryChoice;
      const errorMessage = `${errorMessages.noOptionSelectedStart}principal office address${errorMessages.noOptionSelectedEnd}`;

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, errorMessage)).toBe(2);
      expect(res.text).toContain(
        `${generalPartnerLegalEntity.legal_entity_name.toUpperCase()}`
      );
    });
  });
});
