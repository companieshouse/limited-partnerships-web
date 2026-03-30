import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, feedTransactionAndPartner, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";

import {
  ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { limitedPartnerLegalEntity, limitedPartnerPerson } from "../../../../builder/LimitedPartnerBuilder";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("Limited Partner Principal Office Address Territory Choice", () => {
  const URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("Get limited partner principal office address territory choice page", () => {
    it.each([
      "en",
      "cy"
    ])("should load the limited partner principal office address territory choice page with %s text", async (lang: string) => {
      setLocalesEnabled(true);
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      feedTransactionAndPartner(PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${translationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress.title} - ${translationText.serviceName.addLimitedPartner} - GOV.UK`
        )
      );

      testTranslations(res.text, translationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress);
      testTranslations(res.text, translationText.address.territories);
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(limitedPartnerPerson.surname?.toUpperCase());
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }
      expect(countOccurrences(res.text, translationText.serviceName.addLimitedPartner)).toBe(2);
    });
  });

  describe("Post limited partner principal office address territory choice page", () => {
    it("should redirect to What is the limited partner's principal office address? post code look up page when united kingdom is selected", async () => {
      const UNITED_KINGDOM_PARAMETER = "unitedKingdom";
      const POSTCODE_URL = getUrl(POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress,
        parameter: UNITED_KINGDOM_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(POSTCODE_URL);
      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["poa_territory_choice"]: "unitedKingdom"
          }
        }
      });
    });

    it("should redirect to What is the limited partner's principal office address? manual entry page when overseas is selected", async () => {
      const OVERSEAS_PARAMETER = "overseas";
      const MANUAL_ENTRY_URL = getUrl(ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress,
        parameter: OVERSEAS_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(MANUAL_ENTRY_URL);
      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ["poa_territory_choice"]: "overseas"
          }
        }
      });
    });
  });
});
