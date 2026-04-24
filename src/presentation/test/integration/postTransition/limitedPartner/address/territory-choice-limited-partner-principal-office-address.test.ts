import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enGeneralTranslationText from "../../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../../locales/cy/address.json";
import enErrorTranslationText from "../../../../../../../locales/en/errors.json";
import cyErrorTranslationText from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";

import {
  ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnerBuilder, { limitedPartnerLegalEntity } from "../../../../builder/LimitedPartnerBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("Limited Partner Principal Office Address Territory Choice", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorTranslationText };
  const URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isLegalEntity()
      .withKind(PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY)
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("Get limited partner principal office address territory choice page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the limited partner principal office address territory choice page with %s text", async (language: string, lang: string, translationText: Record<string, any>) => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${translationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress.title} - ${translationText.serviceName.addLimitedPartner} - GOV.UK`
        )
      );

      testTranslations(res.text, translationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress);
      testTranslations(res.text, translationText.address.territories);
      expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.addLimitedPartner))).toBe(2);

      expect(res.text).toContain(`${limitedPartnerLegalEntity.legal_entity_name.toUpperCase()}`);
    });
  });

  describe("Post limited partner principal office address territory choice page", () => {
    it.each([
      ["United Kingdom", "unitedKingdom", POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL],
      ["Overseas", "overseas", ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL]
    ])("should redirect to the correct page when %s is selected", async (option: string, parameter: string, expectedUrl: string) => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress,
        parameter: parameter
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(getUrl(expectedUrl));

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
        pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress
      });

      const errorMessages = enTranslationText.errorMessages.address.territoryChoice;
      const errorMessage = `${errorMessages.noOptionSelectedStart}principal office address${errorMessages.noOptionSelectedEnd}`;

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, errorMessage)).toBe(2);
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });
  });
});
