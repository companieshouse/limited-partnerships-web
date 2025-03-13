import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import app from "../../../app";

import { POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../../controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity,
  generalPartnerPerson
} from "../../../../builder/GeneralPartnerBuilder";

describe("Postcode Usual Residential Address Page", () => {
  const URL = getUrl(POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get Postcode Usual Residential Address Page", () => {
    it("should load the usual residential address page with English text", async () => {
      setLocalesEnabled(true);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.address.findPostcode.usualResidentialAddress.whatIsUsualResidentialAddress} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain(generalPartner.data?.forename?.toUpperCase());
      expect(res.text).toContain(generalPartner.data?.surname?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load the usual residential address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.address.findPostcode.usualResidentialAddress.whatIsUsualResidentialAddress} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "errorMessages"
      ]);
      expect(res.text).toContain(generalPartner.data?.legal_entity_name?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.forename?.toUpperCase());
    });
  });
});
