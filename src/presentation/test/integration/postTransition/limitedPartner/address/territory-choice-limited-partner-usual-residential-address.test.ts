import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import {
  ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnerBuilder, { limitedPartnerPerson } from "../../../../builder/LimitedPartnerBuilder";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL, UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL } from "../../../../../controller/postTransition/url";

describe("Limited Partner Usual Residential Address Territory Choice", () => {
  const URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_LIMITED_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET /limited-partner-usual-residential-address-choose-territory", () => {
    it("should load the limited partner usual residential address territory choice page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${cyTranslationText.address.territoryChoice.limitedPartnerUsualResidentialAddress.title} - ${cyTranslationText.serviceName.addLimitedPartner} - GOV.UK`
        )
      );

      testTranslations(res.text, cyTranslationText.address.territoryChoice.limitedPartnerUsualResidentialAddress);
      testTranslations(res.text, cyTranslationText.address.territories);
      expect(countOccurrences(res.text, cyTranslationText.serviceName.addLimitedPartner)).toBe(2);
    });

    it("should load the limited partner usual residential address territory choice page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${enTranslationText.address.territoryChoice.limitedPartnerUsualResidentialAddress.title} - ${enTranslationText.serviceName.addLimitedPartner} - GOV.UK`
        )
      );

      testTranslations(res.text, enTranslationText.address.territories);
      expect(countOccurrences(res.text, enTranslationText.serviceName.addLimitedPartner)).toBe(2);
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

    it.each([
      ["update", PartnerKind.UPDATE_LIMITED_PARTNER_PERSON, UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL],
      ["add", PartnerKind.ADD_LIMITED_PARTNER_PERSON, ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL]
    ])("should contain the correct back link when on %s limited partner person journey", async (_description: string, partnerKind: PartnerKind, backUrl: string) => {
      const limitedPartner = new LimitedPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .withKind(partnerKind)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        getUrl(backUrl)
      );
    });
  });

  describe("POST /limited-partner-territory-choice", () => {
    it("should redirect to What is the limited partners URA? post code look up page when united kingdom is selected", async () => {
      const UNITED_KINGDOM_PARAMETER = "unitedKingdom";
      const POSTCODE_URL = getUrl(POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
        parameter: UNITED_KINGDOM_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(POSTCODE_URL);
      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ura_territory_choice: "unitedKingdom"
          }
        }
      });
    });

    it("should redirect to What is the limited partners URA? manual entry page when overseas is selected", async () => {
      const OVERSEAS_PARAMETER = "overseas";
      const MANUAL_ENTRY_URL = getUrl(ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
        parameter: OVERSEAS_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(MANUAL_ENTRY_URL);
      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ura_territory_choice: "overseas"
          }
        }
      });
    });
  });
});
