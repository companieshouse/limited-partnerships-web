import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../config/dev-dependencies";
import app from "../../app";

import { POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL } from "../../../../controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";

describe("Postcode Principal Place Of Business Address Page", () => {
  const URL = getUrl(POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL);

  beforeAll(() => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);
  });

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);
  });

  describe("Get Postcode Principal Place Of Business Address Page", () => {
    it("should load the page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.address.findPostcode.principalPlaceOfBusiness.whatIsPrincipalPlaceOfBusiness} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.address.findPostcode, [
        "registeredOfficeAddress"
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.address.findPostcode.principalPlaceOfBusiness.whatIsPrincipalPlaceOfBusiness} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.address.findPostcode, [
        "registeredOfficeAddress"
      ]);
    });
  });
});
