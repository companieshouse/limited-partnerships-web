import request from "supertest";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";

import { getServiceTitle, isPostTransition } from "../utils";
import { SERVICE_NAME_KEY_REGISTRATION, SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

type GeneralPartnerChoiceTestConfig = {
  url: string;
  pageType: string;
  redirectUrlPerson: string;
  redirectUrlLegalEntity: string;
  translateExclude: string[];
  serviceTitleTranslationKey: string | { serviceName: string };
};

export const runGeneralPartnerChoiceTests = (config: GeneralPartnerChoiceTestConfig) => {
  describe("General Partner Choice Page", () => {

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
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the general partner choice page with %s text",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.partner.generalPartnerChoicePage.title} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
        );

        let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
        if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
          partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
        } else if (isPostTransition(config.serviceTitleTranslationKey)) {
          partnershipName = `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`;
        }

        expect(res.text).toContain(partnershipName);

        testTranslations(res.text, translationText.partner.generalPartnerChoicePage, config.translateExclude);

        if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
          const key = config.serviceTitleTranslationKey === SERVICE_NAME_KEY_REGISTRATION ? "registration" : "addGeneralPartner";
          expect(res.text).toContain(customerFeedbackUrlMap[key]);
        }
      }
    );

    it.each([
      ["Person", "person", config.redirectUrlPerson],
      ["Legal Entity", "legalEntity", config.redirectUrlLegalEntity]
    ])("should redirect to General Partner %s page when person is selected", async (_description: string, parameter: string, redirectUrl: string) => {
      const res = await request(app).post(getUrl(config.url)).send({
        pageType: config.pageType,
        parameter
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(getUrl(redirectUrl));
    });

    it.each([
      ["en", enTranslationText],
      ["cy", cyTranslationText]
    ])("%s: should trigger GDS validation error when no option is selected", async (lang, errors) => {
      const res = await request(app).post(`${config.url}?lang=${lang}`).send({
        pageType: config.pageType
      });

      const errorMessage = errors.errorMessages.choosePartnerType.generalPartner;

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, errorMessage)).toBe(2);
    });
  });
};

