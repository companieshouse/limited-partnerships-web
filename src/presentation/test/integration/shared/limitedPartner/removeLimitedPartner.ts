import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";

import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";

import TransactionLimitedPartner from "../../../../../domain/entities/TransactionLimitedPartner";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

type RemoveLimitedPartnerTestConfig = {
    url: string;
    pageType: {
        removeLimitedPartner: string;
    },
    redirectUrlReview: string;
    translateExclude: string[];
    serviceTitleTranslationKey: string;
}

export const runRemoveLimitedPartnerTests = (config: RemoveLimitedPartnerTestConfig) => {
  describe("Remove Limited Partner Page", () => {
    let limitedPartnership: TransactionLimitedPartnership;
    let companyProfile: {
          _id: string;
          data: Partial<CompanyProfile>;
        };
    let limitedPartnerPerson: TransactionLimitedPartner;

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      limitedPartnerPerson = new LimitedPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .build();
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);
    });

    describe("Get Remove Limited Partners Page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])("should load the remove limited partners page with %s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
        const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.partner.removePartnerPage.title} - ${translationText[config.serviceTitleTranslationKey]} - GOV.UK`
        );

        let partnershipName = `${limitedPartnership?.data?.partnership_name?.toUpperCase()}`;
        if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
          partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
        }

        expect(res.text).toContain(partnershipName);

        testTranslations(res.text, translationText.partner.removePartnerPage);

        expect(res.text).toContain(`${limitedPartnerPerson?.data?.forename} ${limitedPartnerPerson?.data?.surname}`);
      });
    });

    describe("Post Remove Limited Partners Page", () => {
      it.each([
        ["", "yes", 0],
        ["not", "no", 1]
      ])("should redirect to the review limited partners page - lp %s removed", async (_description: string, remove: string, count: number) => {
        const res = await request(app).post(getUrl(config.url)).send({
          pageType: config.pageType.removeLimitedPartner,
          remove
        });

        expect(res.status).toBe(302);

        expect(res.header.location).toBe(getUrl(config.redirectUrlReview));

        expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(count);
      });

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should trigger validation errors when no option is selected: %s", async (lang, errors) => {
        const res = await request(app)
          .post(`${getUrl(config.url)}?lang=${lang}`)
          .send({
            pageType: config.pageType.removeLimitedPartner
          });

        expect(res.status).toBe(200);

        expect(countOccurrences(res.text, errors.errorMessages.partners.removePartner.selectRemoveChoice)).toBe(2);
      });
    });
  });

};
