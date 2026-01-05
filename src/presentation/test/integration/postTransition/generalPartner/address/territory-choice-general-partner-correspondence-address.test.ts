import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import {
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, { generalPartnerLegalEntity, generalPartnerPerson } from "../../../../builder/GeneralPartnerBuilder";
import { GeneralPartner, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";
import { UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL } from "../../../../../controller/postTransition/url";

describe("General Partner Correspondence Address Territory Choice", () => {
  const URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get general partner correspondance address territory choice page", () => {
    it("should load the general partner correspondance address territory choice page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${cyTranslationText.address.territoryChoice.generalPartnerCorrespondenceAddress.title} - ${cyTranslationText.servicePostTransition} - GOV.UK`
        )
      );

      testTranslations(res.text, cyTranslationText.address.territoryChoice.generalPartnerCorrespondenceAddress);
      testTranslations(res.text, cyTranslationText.address.territories);
    });

    it("should load the general partner correspondance address territory choice page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${enTranslationText.address.territoryChoice.generalPartnerCorrespondenceAddress.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
        )
      );

      testTranslations(res.text, enTranslationText.address.territoryChoice.generalPartnerCorrespondenceAddress);
      testTranslations(res.text, enTranslationText.address.territories);
    });

    it("should contain the legal entity name ", async () => {
      const generalPartner: GeneralPartner = new GeneralPartnerBuilder()
        .isLegalEntity()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name.toUpperCase());
    });

    it("should contain the person name - data from API", async () => {
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
      ["update", PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL],
      ["add", PartnerKind.ADD_GENERAL_PARTNER_PERSON, CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL]
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

  describe("Post general partner correspondance address territory choice page", () => {
    it("should redirect to What is the general partner's correspondance address? post code look up page when united kingdom is selected", async () => {
      const UNITED_KINGDOM_PARAMETER = "unitedKingdom";
      const POSTCODE_URL = getUrl(POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
        parameter: UNITED_KINGDOM_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(POSTCODE_URL);
      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            sa_territory_choice: "unitedKingdom"
          }
        }
      });
    });

    it("should redirect to What is the general partner's correspondance address? manual entry page when overseas is selected", async () => {
      const OVERSEAS_PARAMETER = "overseas";
      const MANUAL_ENTRY_URL = getUrl(ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
        parameter: OVERSEAS_PARAMETER
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(MANUAL_ENTRY_URL);
      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            sa_territory_choice: "overseas"
          }
        }
      });
    });
  });
});
