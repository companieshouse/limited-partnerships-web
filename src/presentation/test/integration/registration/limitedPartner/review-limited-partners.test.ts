import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { REVIEW_LIMITED_PARTNERS_URL } from "../../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";

describe("Review Limited Partners Page", () => {
  const URL = getUrl(REVIEW_LIMITED_PARTNERS_URL);

  const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
  const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().build();

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);
  });

  describe("Get Review Limited Partners Page", () => {
    it("should load the review limited partners page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${enTranslationText.reviewLimitedPartnersPage.title} - ${enTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, enTranslationText.reviewLimitedPartnersPage, ["emptyList"]);

      expect(res.text).toContain(`${limitedPartnerPerson?.data?.forename} ${limitedPartnerPerson?.data?.surname}`);
      expect(res.text).toContain(`${limitedPartnerLegalEntity?.data?.legal_entity_name}`);
    });

    it("should load the review limited partners page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${cyTranslationText.reviewLimitedPartnersPage.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.reviewLimitedPartnersPage, ["emptyList"]);
    });

    describe("Empty list", () => {
      it("should load the review limited partners page and contains empty list text", async () => {
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${enTranslationText.reviewLimitedPartnersPage.title} - ${enTranslationText.service} - GOV.UK`
        );
        expect(res.text).toContain(enTranslationText.reviewLimitedPartnersPage.limitedPartnersAdded.emptyList);
      });
    });
  });
});
