import request from "supertest";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { ApiErrors } from "../../../../domain/entities/UIErrors";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../utils";

import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import TransactionLimitedPartnership from "../../../../domain/entities/TransactionLimitedPartnership";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";

import { customerFeedbackUrlMap } from "../../../../middlewares/customer-feedback.middleware";

type AddGeneralPartnerLegalEntityTestConfig = {
  url: string;
  urlWithIds: string;
  pageType: {
    addGeneralPartnerLegalEntity: string;
    reviewGeneralPartners: string;
    generalPartnerType: string;
  };
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

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
      appDevDependencies.generalPartnerGateway.feedErrors();
    });

    describe("Get Add General Partner Legal Entity Page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should load the add general partner legal entity page with English text",
        async (_description: string, lang: string, translationText: Record<string, any>) => {
          const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

          expect(res.status).toBe(200);

          expect(res.text).toContain(
            `${translationText.partner.addOrUpdatePartnerLegalEntityPage.generalPartner.title} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
          );

          let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
          if (config.serviceTitleTranslationKey === "serviceTransition") {
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

          const BACK_LINK = `${getUrl(config.baseUrlWithIds)}/${config.pageType.generalPartnerType}`;

          const regex = new RegExp(BACK_LINK);
          expect(res.text).toMatch(regex);

          if (isPostTransition(config.serviceTitleTranslationKey)) {
            expect(countOccurrences(res.text, enTranslationText.serviceName.addGeneralPartner)).toBe(4);
            expect(res.text).toContain(customerFeedbackUrlMap.addGeneralPartner);
          }
        }
      );

      it("should contain a back link to the review page when general partners are present", async () => {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isPerson()
          .build();
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const res = await request(app).get(getUrl(config.urlWithIds));

        expect(res.status).toBe(200);

        const BACK_LINK = `${getUrl(config.baseUrlWithIds)}/${config.pageType.reviewGeneralPartners}`;

        const regex = new RegExp(BACK_LINK);
        expect(res.text).toMatch(regex);
      });
    });

    describe("Post Add General Partner Legal Entity", () => {
      it("should send the general partner legal entity details", async () => {
        const res = await request(app).post(getUrl(config.url)).send({
          pageType: config.pageType.addGeneralPartnerLegalEntity,
          legal_entity_name: "test"
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);

        if (isPostTransition(config.serviceTitleTranslationKey)) {
          expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
          expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
            enTranslationText.partner.addOrUpdatePartnerLegalEntityPage.generalPartner.title
          );

          expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
          expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(config.partnerKind);
        }
      });

      it("should return a validation error when invalid data is entered", async () => {
        const apiErrors: ApiErrors = {
          errors: { legal_entity_name: "Legal entity name is invalid" }
        };

        appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

        const res = await request(app).post(getUrl(config.url)).send({
          pageType: config.pageType.addGeneralPartnerLegalEntity,
          legal_entity_name: "INVALID-CHARACTERS"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain("Legal entity name is invalid");
      });

      it("should send the general partner details and go to confirm ura address page if already saved", async () => {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isLegalEntity()
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const res = await request(app)
          .post(getUrl(config.urlWithIds))
          .send({
            pageType: config.pageType.addGeneralPartnerLegalEntity,
            ...generalPartner.data
          });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl)}`);
      });
    });
  });
};

const getServiceTitle = (
  serviceTitleTranslationKey: AddGeneralPartnerLegalEntityTestConfig["serviceTitleTranslationKey"],
  translationText: Record<string, any>
): string =>
  typeof serviceTitleTranslationKey === "string" ?
    translationText[serviceTitleTranslationKey]
    : translationText.serviceName[serviceTitleTranslationKey.serviceName];

const isPostTransition = (
  serviceTitleTranslationKey: AddGeneralPartnerLegalEntityTestConfig["serviceTitleTranslationKey"]
): boolean => typeof serviceTitleTranslationKey !== "string";
