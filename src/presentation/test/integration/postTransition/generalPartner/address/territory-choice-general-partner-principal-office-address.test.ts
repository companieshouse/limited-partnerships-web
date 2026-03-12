import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, feedTransactionAndPartner, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";

import {
  ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { generalPartnerLegalEntity, generalPartnerPerson } from "../../../../builder/GeneralPartnerBuilder";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("General Partner Principal Office Address Territory Choice", () => {
  const URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("Get general partner principal office address territory choice page", () => {
    it.each(
      [
        ["en"],
        ["cy"],
      ]
    )("should load the general partner principal office address territory choice page with %s text", async (lang: string) => {
      setLocalesEnabled(true);
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      feedTransactionAndPartner(PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${translationText.address.territoryChoice.generalPartnerPrincipalOfficeAddress.title} - ${translationText.serviceName.addGeneralPartner} - GOV.UK`
        )
      );

      testTranslations(res.text, translationText.address.territoryChoice.generalPartnerPrincipalOfficeAddress);
      testTranslations(res.text, translationText.address.territories);
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }
      expect(res.text).not.toContain(generalPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.surname?.toUpperCase());
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
      expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.addGeneralPartner))).toBe(2);
    });
  });

  describe("Post general partner principal office address territory choice page", () => {
    it("should redirect to What is the general partner's principal office address? post code look up page when united kingdom is selected", async () => {
      const UNITED_KINGDOM_PARAMETER = "unitedKingdom";
      const POSTCODE_URL = getUrl(POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress,
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

    it("should redirect to What is the general partner's principal office address? manual entry page when overseas is selected", async () => {
      const OVERSEAS_PARAMETER = "overseas";
      const MANUAL_ENTRY_URL = getUrl(ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress,
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
