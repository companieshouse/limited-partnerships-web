import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import app from "../../../app";

import { POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../../controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

describe("Postcode Usual Residential Address Page", () => {
  const URL = getUrl(POSTCODE_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);
  });

  describe("Get Postcode Usual Residential Address Page", () => {
    it("should load the usual residential address page with English text", async () => {
      setLocalesEnabled(true);
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
    });

    it("should load the usual residential address page with Welsh text", async () => {
      setLocalesEnabled(true);
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
    });
  });
});
