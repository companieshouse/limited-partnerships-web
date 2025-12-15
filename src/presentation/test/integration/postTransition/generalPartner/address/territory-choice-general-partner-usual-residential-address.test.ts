import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import {
  ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, { generalPartnerPerson } from "../../../../builder/GeneralPartnerBuilder";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL, UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL } from "../../../../../../presentation/controller/postTransition/url";

describe("General Partner Usual Residential Address Territory Choice", () => {
  const URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

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
        toEscapedHtml(
          `${cyTranslationText.address.territoryChoice.generalPartnerUsualResidentialAddress.title} - ${cyTranslationText.servicePostTransition} - GOV.UK`
        )
      );

      testTranslations(res.text, cyTranslationText.address.territoryChoice.generalPartnerUsualResidentialAddress);
      testTranslations(res.text, cyTranslationText.address.territories);
    });

    it("should load the general partner usual residential address territory choice page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${enTranslationText.address.territoryChoice.generalPartnerUsualResidentialAddress.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
        )
      );

      testTranslations(res.text, enTranslationText.address.territories);
    });

    it("should contain the general partner name - data from API", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${generalPartnerPerson.forename.toUpperCase()} ${generalPartnerPerson.surname.toUpperCase()}`
      );
    });

    it.each([
      ["update", PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL],
      ["add", PartnerKind.ADD_GENERAL_PARTNER_PERSON, ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL]
    ])("should contain the correct back link when on %s general partner person journey", async (_description: string, partnerKind: PartnerKind, backUrl: string) => {
      const generalPartner = new GeneralPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .withKind(partnerKind)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        getUrl(backUrl)
      );
    });
  });

  describe("POST /general-partner-territory-choice", () => {
    it("should redirect to What is the general partners URA? post code look up page when united kingdom is selected", async () => {
      const UNITED_KINGDOM_PARAMETER = "unitedKingdom";
      const POSTCODE_URL = getUrl(POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress,
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

    it("should redirect to What is the general partners URA? manual entry page when overseas is selected", async () => {
      const OVERSEAS_PARAMETER = "overseas";
      const MANUAL_ENTRY_URL = getUrl(ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress,
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
