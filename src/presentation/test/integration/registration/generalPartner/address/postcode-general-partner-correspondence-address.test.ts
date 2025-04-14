import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import app from "../../../app";

import { getUrl, setLocalesEnabled, toEscapedHtml, testTranslations } from "../../../../utils";
import { POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL } from "presentation/controller/addressLookUp/url";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity
} from "../../../../builder/GeneralPartnerBuilder";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";

describe("Postcode general partner's correspondence address page", () => {
  const URL = getUrl(POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  describe("Get postcode general partner's correspondence address page", () => {
    it("should load the correspondence address page with English text", async () => {
      setLocalesEnabled(true);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(enTranslationText.address.findPostcode.correspondenceAddress.whatIsCorrespondenceAddress) + ` - ${enTranslationText.service} - GOV.UK`);
      testTranslations(res.text, enTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).toContain(generalPartner.data?.forename?.toUpperCase());
      expect(res.text).toContain(generalPartner.data?.surname?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });

    it("should load the correspondence address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(cyTranslationText.address.findPostcode.correspondenceAddress.whatIsCorrespondenceAddress) + ` - ${cyTranslationText.service} - GOV.UK`);
      testTranslations(res.text, cyTranslationText.address.findPostcode, [
        "registeredOfficeAddress",
        "principalPlaceOfBusiness",
        "usualResidentialAddress",
        "principalOfficeAddress",
        "errorMessages"
      ]);
      expect(res.text).toContain("WELSH -");
      expect(res.text).toContain(generalPartner.data?.forename?.toUpperCase());
      expect(res.text).toContain(generalPartner.data?.surname?.toUpperCase());
      expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());
    });
  });

  describe("Post postcode general partner's correspondence address page", () => {
    it("should return an error if the postcode is not valid", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeGeneralPartnerCorrespondenceAddress,
        premises: null,
        postal_code: "AA1 1AA"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(`The postcode AA1 1AA cannot be found`);

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});
