import request from "supertest";
import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/transition";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, { generalPartnerLegalEntity } from "../../../../builder/GeneralPartnerBuilder";

describe("General Partner Correspondence Address Territory Choice", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorTranslationText };
  const URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const generalPartner: GeneralPartner = new GeneralPartnerBuilder()
      .isLegalEntity()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("Get general partner correspondence address territory choice page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the general partner correspondence address territory choice page with %s text", async (language: string, langParam: string, translationText: Record<string, any>) => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + `?lang=${langParam}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${translationText.address.territoryChoice.generalPartnerCorrespondenceAddress.title} - ${translationText.serviceTransition} - GOV.UK`
        )
      );

      testTranslations(res.text, translationText.address.territoryChoice.generalPartnerCorrespondenceAddress);
      testTranslations(res.text, translationText.address.territories);

      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name.toUpperCase());
    });
  });

  describe("Post general partner correspondance address territory choice page", () => {
    it.each([
      ["United Kingdom", "unitedKingdom", POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL],
      ["Overseas", "overseas", ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL]
    ])("should redirect to the correct page based on the territory choice", async (option: string, parameter: string, expectedRedirectUrl: string) => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
        parameter: parameter
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(getUrl(expectedRedirectUrl));

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            sa_territory_choice: parameter
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
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });
  });
});
