import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";

import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";

import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { SERVICE_NAME_KEY_REGISTRATION, SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

type GeneralPartnersTestConfig = {
  url: string;
  pageType: {
    generalPartners: string;
    generalPartnerType: string;
  },
  redirectUrlReview: string;
  baseUrlWithIds: string;
  translateExclude: string[];
  serviceTitleTranslationKey: string;
};

export const runGeneralPartnersTests = (config: GeneralPartnersTestConfig) => {
  describe("General Partners Page", () => {
    let limitedPartnership: TransactionLimitedPartnership;

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the general partners page with %s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${translationText.partner.generalPartnersPage.title} - ${translationText[config.serviceTitleTranslationKey]} - GOV.UK`
      );

      testTranslations(res.text, translationText.partner.generalPartnersPage, config.translateExclude);
    });

    it("should contain the proposed name - data from api", async () => {
      const res = await request(app).get(getUrl(config.url));

      expect(res.status).toBe(200);

      let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
      if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
        partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
      }

      expect(res.text).toContain(partnershipName);
    });

    it.each([
      [PartnershipType.LP, "standard-industrial-classification-code"],
      [PartnershipType.SLP, "standard-industrial-classification-code"],
      [PartnershipType.PFLP, "confirm-principal-place-of-business"],
      [PartnershipType.SPFLP, "confirm-principal-place-of-business"]
    ])(
      "should contain the correct back link based on partnership type",
      async (partnershipType: PartnershipType, backLink: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(getUrl(config.url));

        expect(res.status).toBe(200);

        if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_REGISTRATION) {
          expect(res.text).toContain(`${getUrl(config.baseUrlWithIds)}/${backLink}`);
        } else {
          expect(res.text).toContain(`${getUrl(config.baseUrlWithIds)}/${config.pageType.generalPartnerType}`);
        }
      }
    );

    it("should redirect to review page if list not empty", async () => {
      const generalPartner = new GeneralPartnerBuilder().isPerson().build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(getUrl(config.url));

      expect(res.status).toBe(302);
      expect(res.text).toContain(getUrl(config.redirectUrlReview));
    });
  });

};
