
import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import app from "../../../app";
import { getUrl, setLocalesEnabled, toEscapedHtml, testTranslations } from "../../../../utils";
import { POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL } from "presentation/controller/addressLookUp/url";
import GeneralPartnerBuilder, {
  generalPartnerPerson,
  generalPartnerLegalEntity
} from "../../../../builder/GeneralPartnerBuilder";

describe("Postcode general partner's correspondence address page", () => {
  const URL = getUrl(POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  describe("Get postcode general partner's correspondence address page", () => {
    it("should load the correspondence address page with English text", async () => {
      setLocalesEnabled(true);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(enTranslationText.address.findPostcode.correspondenceAddress.whatIsPrincipalOfficeAddress) + ` - ${enTranslationText.service} - GOV.UK`);
      testTranslations(res.text, enTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).not.toContain(generalPartnerPerson.forename.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.surname.toUpperCase());
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load the correspondence address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(cyTranslationText.address.findPostcode.correspondenceAddress.whatIsPrincipalOfficeAddress) + ` - ${cyTranslationText.service} - GOV.UK`);
      testTranslations(res.text, cyTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).toContain("WELSH -");
      expect(res.text).not.toContain(generalPartnerPerson.forename.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.surname.toUpperCase());
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });
  });
});
