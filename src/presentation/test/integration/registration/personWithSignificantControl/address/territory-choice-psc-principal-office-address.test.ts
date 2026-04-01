import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import {
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/registration";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

describe("PSC Principal Office Address Territory Choice", () => {
  const URL = getUrl(TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  describe("GET PSC principal office address territory choice", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the PSC principal office address territory choice page with %s text",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);
        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          toEscapedHtml(
            `${translationText.address.territoryChoice.personWithSignificantControlPrincipalOfficeAddress.title} - ${translationText.serviceRegistration} - GOV.UK`
          )
        );

        testTranslations(res.text, translationText.address.territoryChoice.personWithSignificantControlPrincipalOfficeAddress);
        testTranslations(res.text, translationText.address.territories);
      }
    );
  });

  describe("POST PSC territory choice", () => {
    it("should redirect to postcode lookup page when United Kingdom is selected", async () => {
      const POSTCODE_URL = getUrl(POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoicePersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
        parameter: "unitedKingdom"
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

    it("should redirect to manual entry page when overseas is selected", async () => {
      const MANUAL_ENTRY_URL = getUrl(ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoicePersonWithSignificantControlRelevantLegalEntityPrincipalOfficeAddress,
        parameter: "overseas"
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
