import request from "supertest";
import { LimitedPartner, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";

import {
  ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnerBuilder, { limitedPartnerLegalEntity } from "../../../../builder/LimitedPartnerBuilder";
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
    it("should load the limited partner principal office address territory choice page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${cyTranslationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress.title} - ${cyTranslationText.serviceName.addLimitedPartner} - GOV.UK`
        )
      );

      testTranslations(res.text, cyTranslationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress);
      testTranslations(res.text, cyTranslationText.address.territories);
      expect(countOccurrences(res.text, cyTranslationText.serviceName.addLimitedPartner)).toBe(2);
    });

    it("should load the limited partner principal office address territory choice page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${enTranslationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress.title} - ${enTranslationText.serviceName.addLimitedPartner} - GOV.UK`
        )
      );

      testTranslations(res.text, enTranslationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress);
      testTranslations(res.text, enTranslationText.address.territories);
      expect(countOccurrences(res.text, enTranslationText.serviceName.addLimitedPartner)).toBe(2);
    });

    it("should contain the legal entity name ", async () => {
      const limitedPartner: LimitedPartner = new LimitedPartnerBuilder()
        .isLegalEntity()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name.toUpperCase());
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
