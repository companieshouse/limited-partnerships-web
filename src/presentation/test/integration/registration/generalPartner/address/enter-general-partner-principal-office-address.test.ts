import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "presentation/controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity,
  generalPartnerPerson
} from "../../../../builder/GeneralPartnerBuilder";

describe("Enter general partner's principal office manual address page", () => {
  const URL = getUrl(ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache(null);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get enter general partner's principal office address page", () => {
    it("should load enter general partners principal office address page with English text", async () => {
      setLocalesEnabled(true);
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "postcodeLength",
        "usualResidentialAddress",
        "correspondenceAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).not.toContain(generalPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.surname?.toUpperCase());
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load enter general partners principal office address page with Welsh text", async () => {
      setLocalesEnabled(true);
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.enterAddress, [
        "registeredOfficeAddress",
        "principalPlaceOfBusinessAddress",
        "jurisdictionCountry",
        "postcodeMissing",
        "postcodeLength",
        "usualResidentialAddress",
        "correspondenceAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).toContain("WELSH -");
      expect(res.text).not.toContain(generalPartnerPerson.forename?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerPerson.surname?.toUpperCase());
      expect(res.text).toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });
  });

  describe("Post enter general partner's principal office address page", () => {
    it("should redirect to the error page when error occurs during Post", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: ""
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });
  });
});
