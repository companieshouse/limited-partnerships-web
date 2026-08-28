import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";

import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

import { getServiceTitle } from "../utils";

type LimitedPartnersTestConfig = {
    url: string;
    pageType: string;
    redirectUrlReview: string;
    baseUrlWithIds: string;
    translateExclude: string[];
    serviceTitleTranslationKey: string;
}

export const runLimitedPartnersTests = (config: LimitedPartnersTestConfig) => {
  describe("Limited Partners Page", () => {
    let limitedPartnership: TransactionLimitedPartnership;

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the limited partners page with %s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${translationText.partner.limitedPartnersPage.title} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
      );

      let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
      if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
        partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
      }

      expect(res.text).toContain(partnershipName);

      testTranslations(res.text, translationText.partner.limitedPartnersPage, config.translateExclude);

      expect(res.text).toContain(`${getUrl(config.baseUrlWithIds)}/${config.pageType}`);
    });

    it("should redirect to review page if list not empty", async () => {
      const limitedPartner = new LimitedPartnerBuilder().isPerson().build();
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(getUrl(config.url));

      expect(res.status).toBe(302);

      expect(res.text).toContain(getUrl(config.redirectUrlReview));
    });
  });

};
