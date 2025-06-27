import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";

import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { REMOVE_LIMITED_PARTNER_URL, REVIEW_LIMITED_PARTNERS_URL } from "../../../../controller/transition/url";
import RegistrationPageType from "../../../../controller/transition/PageType";

describe("Remove Limited Partner Page", () => {
  const URL = getUrl(REMOVE_LIMITED_PARTNER_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("Get Remove Limited Partners Page", () => {
    it("should load the remove limited partners page with English text", async () => {
      setLocalesEnabled(true);

      const limitedPartnerPerson = new LimitedPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${enTranslationText.removePartnerPage.title} - ${enTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, enTranslationText.removePartnerPage);

      expect(res.text).toContain(`${limitedPartnerPerson?.data?.forename} ${limitedPartnerPerson?.data?.surname}`);
    });

    it("should load the remove limited partners page with Welsh text", async () => {
      setLocalesEnabled(true);

      const limitedPartnerLegalEntity = new LimitedPartnerBuilder()
        .isLegalEntity()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${cyTranslationText.removePartnerPage.title} - ${cyTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, cyTranslationText.removePartnerPage);

      expect(res.text).toContain(`${limitedPartnerLegalEntity?.data?.legal_entity_name}`);
    });
  });

  describe("Post Remove Limited Partners Page", () => {
    it("should redirect to the review limited partners page - lp removed", async () => {
      setLocalesEnabled(true);

      const limitedPartnerPerson = new LimitedPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.removeLimitedPartner,
        remove: "yes"
      });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(getUrl(REVIEW_LIMITED_PARTNERS_URL));

      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(0);
    });

    it("should redirect to the review limited partners page - lp not removed", async () => {
      setLocalesEnabled(true);

      const limitedPartnerLegalEntity = new LimitedPartnerBuilder()
        .isLegalEntity()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.removeLimitedPartner,
        remove: "no"
      });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(getUrl(REVIEW_LIMITED_PARTNERS_URL));

      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(1);
    });
  });
});
