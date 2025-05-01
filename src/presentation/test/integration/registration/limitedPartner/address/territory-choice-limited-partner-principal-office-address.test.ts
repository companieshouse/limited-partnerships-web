import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import {
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
} from "../../../../../controller/addressLookUp/url";
import LimitedPartnerBuilder, { limitedPartnerPerson } from "../../../../builder/LimitedPartnerBuilder";

describe("Limited Partner Principal Office Address Territory Choice", () => {
  const URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("GET limited-partner-principal-office-address-choose-territory", () => {
    it("should load the limited partner principal office address territory choice page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(`${cyTranslationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress.title} - ${cyTranslationText.service} - GOV.UK`)
      );

      testTranslations(res.text, cyTranslationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress);
      testTranslations(res.text, cyTranslationText.address.territories);
    });

    it("should load the limited partner principal office address territory choice page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(`${enTranslationText.address.territoryChoice.limitedPartnerPrincipalOfficeAddress.title} - ${enTranslationText.service} - GOV.UK`)
      );

      testTranslations(res.text, enTranslationText.address.territories);
    });

    it("should contain the limited partner name - data from API", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${limitedPartnerPerson.forename.toUpperCase()} ${limitedPartnerPerson.surname.toUpperCase()}`
      );
    });
  });
  // POST tests required when pages are available.
  /*
  describe("POST limited-partner-territory-choice", () => {
    it("should redirect to What is the limited partners POA? post code look up page when united kingdom is selected", async () => {
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
            ["poa_territory_choice_limited_partner"]: "unitedKingdom"
          }
        }
      });
    });

    it("should redirect to What is the limited partners POA? manual entry page when overseas is selected", async () => {
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
            ["poa_territory_choice_limited_partner"]: "overseas"
          }
        }
      });
    });
  });*/
});
