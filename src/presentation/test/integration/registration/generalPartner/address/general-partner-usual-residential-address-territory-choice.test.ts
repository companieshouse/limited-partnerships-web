import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../../../presentation/test/utils";
import {
  ENTER_USUAL_RESIDENTIAL_ADDRESS_URL,
  GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOOSE_TERRITORY_URL,
  POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../../presentation/controller/addressLookUp/url";
import AddressPageType from "../../../../../../presentation/controller/addressLookUp/PageType";
import GeneralPartnerBuilder from "../../../../../../presentation/test/builder/GeneralPartnerBuilder";

describe("General Partner Usual Residential Address Territory Choice", () => {
  const URL = getUrl(GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOOSE_TERRITORY_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("GET /general-partner-usual-residential-address-choose-territory", () => {
    it("should load the general partner usual residential address territory choice page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.generalPartnerUsualResidentialAddressTerritoryChoicePage.title} - ${cyTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, cyTranslationText.generalPartnerUsualResidentialAddressTerritoryChoicePage);
    });

    it("should load the general partner usual residential address territory choice page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.generalPartnerUsualResidentialAddressTerritoryChoicePage.title} - ${enTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, enTranslationText.generalPartnerUsualResidentialAddressTerritoryChoicePage);
    });

    it("should contain the general partner name - data from API", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withForename("John")
        .withSurname("Smith")
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${generalPartner?.data?.forename?.toUpperCase()} ${generalPartner?.data?.surname?.toUpperCase()}`);
    });
  });

  describe("POST /general-partner-territory-choice", () => {
    it("should redirect to What is the general partners URA? post code look up page when united kingdom is selected", async () => {
      const UNITED_KINGDOM_PARAMETER = 'unitedKingdom';
      const POSTCODE_URL = getUrl(POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL);
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.generalPartnerUsualResidentialAddressTerritoryChoice,
        parameter: UNITED_KINGDOM_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(POSTCODE_URL);
    });

    it("should redirect to What is the general partners URA? manual entry page when overseas is selected", async () => {
      const OVERSEAS_PARAMETER = 'overseas';
      const MANUAL_ENTRY_URL = getUrl(ENTER_USUAL_RESIDENTIAL_ADDRESS_URL);
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.generalPartnerUsualResidentialAddressTerritoryChoice,
        parameter: OVERSEAS_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(MANUAL_ENTRY_URL);
    });
  });
});
