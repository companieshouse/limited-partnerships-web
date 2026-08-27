import request from "supertest";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";

import { getServiceTitle, isPostTransition } from "../utils";
import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

type LimitedPartnerChoiceTestConfig = {
    url: string;
    pageType: string;
    redirectUrlPerson: string;
    redirectUrlLegalEntity: string;
    translateExclude: string[];
    serviceTitleTranslationKey: string | { serviceName: string };
}

export const runLimitedPartnerChoiceTests = (config: LimitedPartnerChoiceTestConfig) => {
  describe("Limited Partner Choice Page", () => {
    let limitedPartnership: TransactionLimitedPartnership;
    let companyProfile: {
      _id: string;
      data: Partial<CompanyProfile>;
    };

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      appDevDependencies.limitedPartnershipGateway.feedErrors();
      appDevDependencies.cacheRepository.feedCache(null);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the limited partner choice page with $%s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${translationText.partner.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
      );

      let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
      if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
        partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
      } else if (isPostTransition(config.serviceTitleTranslationKey)) {
        partnershipName = `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`;
      }

      expect(res.text).toContain(partnershipName);

      testTranslations(res.text, translationText.partner.limitedPartnerChoicePage, config.translateExclude);
    });

    it.each([
      ["person", getUrl(config.redirectUrlPerson)],
      ["legal entity", getUrl(config.redirectUrlLegalEntity)]
    ])("should redirect to Limited Partner %s page when person is selected", async (partnerType: string, redirectedUrl: string) => {
      const res = await request(app).post(getUrl(config.url)).send({
        pageType: config.pageType,
        parameter: partnerType
      });
      expect(res.status).toBe(302);

      expect(res.text).toContain(getUrl(redirectedUrl));
    });

    it.each([
      ["en", enTranslationText],
      ["cy", cyTranslationText]
    ])("%s: should trigger GDS validation error when no option is selected", async (lang: string, errors: Record<string, any>) => {
      const res = await request(app).post(`${getUrl(config.url)}?lang=${lang}`).send({
        pageType: config.pageType
      });

      expect(res.status).toBe(200);

      expect(countOccurrences(res.text, errors.errorMessages.choosePartnerType.limitedPartner)).toBe(2);
    });
  });

};
