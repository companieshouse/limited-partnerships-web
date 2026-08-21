import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";

import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";

import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

type RemoveGeneralPartnerTestConfig = {
  url: string;
  pageType: {
    removeGeneralPartner: string;
  },
  redirectUrlReview: string;
  translateExclude: string[];
  serviceTitleTranslationKey: string;
};

export const runRemoveGeneralPartnerTests = (config: RemoveGeneralPartnerTestConfig): void => {
  describe("Remove General Partner Page", () => {
    let limitedPartnership: TransactionLimitedPartnership;
    let companyProfile: {
          _id: string;
          data: Partial<CompanyProfile>;
        };
    let generalPartnerPerson: TransactionGeneralPartner;

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      generalPartnerPerson = new GeneralPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson]);
    });

    describe("Get Remove General Partners Page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])("should load the remove general partners page with %s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
        const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

        expect(res.status).toBe(200);

        let partnershipName = `${limitedPartnership?.data?.partnership_name?.toUpperCase()}`;
        if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
          partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
        }

        expect(res.text).toContain(partnershipName);

        expect(res.text).toContain(
          `${translationText.partner.removePartnerPage.title} - ${translationText[config.serviceTitleTranslationKey]} - GOV.UK`
        );

        testTranslations(res.text, translationText.partner.removePartnerPage);

        expect(res.text).toContain(`${generalPartnerPerson?.data?.forename} ${generalPartnerPerson?.data?.surname}`);
      });
    });

    describe("Post Remove General Partners Page", () => {
      it.each([
        ["", "yes", 0],
        ["not", "no", 1]
      ])("should redirect to the review general partners page - gp %s removed", async (_description: string, remove: string, count: number) => {
        const res = await request(app).post(getUrl(config.url)).send({
          pageType: config.pageType.removeGeneralPartner,
          remove
        });

        expect(res.status).toBe(302);
        expect(res.header.location).toBe(getUrl(config.redirectUrlReview));

        expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(count);
      });

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should trigger validation errors when no option is selected", async (lang, errors) => {
        const res = await request(app)
          .post(`${getUrl(config.url)}?lang=${lang}`)
          .send({
            pageType: config.pageType.removeGeneralPartner
          });

        expect(res.status).toBe(200);
        expect(countOccurrences(res.text, errors.errorMessages.partners.removePartner.selectRemoveChoice)).toBe(2);
      });
    });
  });

};
