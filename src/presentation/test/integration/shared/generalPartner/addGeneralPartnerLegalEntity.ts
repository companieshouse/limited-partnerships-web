import request from "supertest";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";

import { getServiceTitle, isPostTransition } from "../utils";
import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";
import { PagesRouting } from "../../../../controller/PageRouting";
import PageType from "../../../../controller/PageType";

type AddGeneralPartnerLegalEntityTestConfig = {
  url: string;
  urlWithIds: string;
  pageType: {
    addGeneralPartnerLegalEntity: string;
    reviewGeneralPartners: string;
    generalPartnerType: string;
  };
  pageRouting: PagesRouting;
  redirectUrl: string;
  confirmRedirectUrl: string;
  baseUrlWithIds: string;
  translateExcludeAddOrUpdatePartnerLegalEntityPage: string[];
  translateExcludeGeneralPartnersPage: string[];
  serviceTitleTranslationKey: string | { serviceName: string };
  partnerKind?: string;
};

export const runAddGeneralPartnerLegalEntityTests = (config: AddGeneralPartnerLegalEntityTestConfig): void => {

  describe("Add General Partner Legal Entity Page", () => {
    let limitedPartnership: TransactionLimitedPartnership;
    let companyProfile: {
      _id: string;
      data: Partial<CompanyProfile>;
    };

    const datesBody = isPostTransition(config.serviceTitleTranslationKey) ? { "date_effective_from-day": "01", "date_effective_from-month": "11", "date_effective_from-year": "2024" } : {};

    const generalPartner = new GeneralPartnerBuilder()
      .isLegalEntity()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .withAppointmentId(appDevDependencies.generalPartnerGateway.generalPartnerAppointmentId)
      .withKind(config.partnerKind ?? "")
      .build();

    beforeEach(() => {
      setLocalesEnabled(true);

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      appDevDependencies.transactionGateway.feedTransactions([]);

      limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    });

    describe("Get Add General Partner Legal Entity Page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should load the add general partner legal entity page with %s text",
        async (_description: string, lang: string, translationText: Record<string, any>) => {
          const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

          expect(res.status).toBe(200);

          expect(res.text).toContain(
            `${translationText.partner.addOrUpdatePartnerLegalEntityPage.generalPartner.title} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
          );

          let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
          if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
            partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
          } else if (isPostTransition(config.serviceTitleTranslationKey)) {
            partnershipName = `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`;
          }

          expect(res.text).toContain(partnershipName);

          testTranslations(
            res.text,
            translationText.partner.addOrUpdatePartnerLegalEntityPage,
            config.translateExcludeAddOrUpdatePartnerLegalEntityPage
          );
          testTranslations(res.text, translationText.partner.generalPartnersPage, config.translateExcludeGeneralPartnersPage);

          const BACK_LINK = `${getUrl(config.baseUrlWithIds)}/${config.pageType.reviewGeneralPartners}`;

          const regex = new RegExp(BACK_LINK);
          expect(res.text).toMatch(regex);

          if (isPostTransition(config.serviceTitleTranslationKey)) {
            expect(countOccurrences(res.text, enTranslationText.serviceName.addGeneralPartner)).toBe(4);
            expect(res.text).toContain(customerFeedbackUrlMap.addGeneralPartner);
          }
        }
      );

      it("should contain a back link to the review page when general partners are present", async () => {
        const res = await request(app).get(getUrl(config.urlWithIds));

        expect(res.status).toBe(200);

        const BACK_LINK = `${getUrl(config.baseUrlWithIds)}/${config.pageType.reviewGeneralPartners}`;

        const regex = new RegExp(BACK_LINK);
        expect(res.text).toMatch(regex);
      });
    });

    describe("Post Add General Partner Legal Entity", () => {
      it("should send the general partner legal entity details", async () => {
        const today = new Date();
        const day = today.getDate().toString().padStart(2, "0");
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const year = today.getFullYear().toString();

        const res = await request(app)
          .post(getUrl(config.url))
          .send({
            ...config.pageRouting.get(config.pageType.addGeneralPartnerLegalEntity as PageType),
            ...generalPartner.data,
            "date_effective_from-day": day,
            "date_effective_from-month": month,
            "date_effective_from-year": year
          });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);

        if (isPostTransition(config.serviceTitleTranslationKey)) {
          expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
          expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
            enTranslationText.partner.addOrUpdatePartnerLegalEntityPage.generalPartner.title
          );

          expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(2);
          expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(config.partnerKind);
        }
      });

      it("should send the general partner details and go to confirm ura address page if already saved", async () => {
        const res = await request(app)
          .post(getUrl(config.urlWithIds))
          .send({
            ...config.pageRouting.get(config.pageType.addGeneralPartnerLegalEntity as PageType),
            ...generalPartner.data,
            ...datesBody
          });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl)}`);
      });
    });
  });
};
