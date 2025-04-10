import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import { TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL } from "../../../../../controller/addressLookUp/url";
import GeneralPartnerBuilder, { generalPartnerLegalEntity } from "../../../../builder/GeneralPartnerBuilder";
import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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
          `${cyTranslationText.address.territoryChoice.generalPartnerCorrespondenceAddress.title} - ${cyTranslationText.service} - GOV.UK`
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
          `${enTranslationText.address.territoryChoice.generalPartnerCorrespondenceAddress.title} - ${enTranslationText.service} - GOV.UK`
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
  });
});
