import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import { SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

type ReviewGeneralPartnersTestConfig = {
  url: string;
  pageType: {
    reviewGeneralPartners: string;
  },
  redirectUrls: {
    generalPartners: string;
    addGeneralPartnerPerson: string;
    addGeneralPartnerLegalEntity: string;
    limitedPartners: string;
    reviewLimitedPartners: string;
  };
  baseUrlWithIds: string;
  translateExclude: string[];
  serviceTitleTranslationKey: string;
};

export const runReviewGeneralPartnersTests = (config: ReviewGeneralPartnersTestConfig): void => {
  describe("Review General Partners Page", () => {

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    const companyProfile = new CompanyProfileBuilder().build();

    const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
    const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().build();

    beforeEach(() => {
      setLocalesEnabled(true);

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships(limitedPartnership);
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    });

    describe("Get Review General Partners Page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])("should load the review general partners page with %s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
        const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
        const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().withCompleted(false).build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

        const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.partner.reviewGeneralPartnersPage.title} - ${translationText[config.serviceTitleTranslationKey]} - GOV.UK`
        );

        testTranslations(res.text, translationText.partner.reviewGeneralPartnersPage, config.translateExclude);

        expect(res.text).toContain(`${generalPartnerPerson?.data?.forename} ${generalPartnerPerson?.data?.surname}`);
        expect(res.text).toContain(`${generalPartnerLegalEntity?.data?.legal_entity_name}`);
        expect(res.text).toContain(
          `${translationText.errorMessages.reviewGeneralPartnersPage.beforeName} ${generalPartnerLegalEntity?.data?.legal_entity_name} ${translationText.errorMessages.reviewGeneralPartnersPage.afterName}`
        );
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

          const BACK_LINK = config.serviceTitleTranslationKey === SERVICE_NAME_KEY_REGISTRATION ? backLink : "confirm-registered-office-address";
          const regex = new RegExp(`${getUrl(config.baseUrlWithIds)}/${BACK_LINK}`);

          expect(res.text).toMatch(regex);
        }
      );

      describe("Empty list", () => {
        it("should redirect to general partners start page when list is empty", async () => {
          appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

          const res = await request(app).get(getUrl(config.url));

          expect(res.status).toBe(302);

          const redirectUrl = getUrl(config.redirectUrls.generalPartners);
          expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
        });
      });
    });

    describe("Post Review General Partners Page", () => {
      it.each([
        ["addPerson", config.redirectUrls.addGeneralPartnerPerson],
        ["addLegalEntity", config.redirectUrls.addGeneralPartnerLegalEntity]
      ])("should redirect to the Add General Partner Person or Legal Entity page when %s is selected", async (addAnotherPartner: string, redirectUrl: string) => {
        const res = await request(app).post(getUrl(config.url)).send({
          pageType: config.pageType.reviewGeneralPartners,
          add_another_partner: addAnotherPartner
        });

        expect(res.status).toBe(302);

        expect(res.headers.location).toContain(getUrl(redirectUrl));
      });

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("%s: should trigger GDS validation error when no option is selected", async (lang, errors) => {

        const res = await request(app).post(`${getUrl(config.url)}?lang=${lang}`).send({
          pageType: config.pageType.reviewGeneralPartners
        });

        const errorMessage = errors.errorMessages.reviewPartners.generalPartner;

        expect(res.status).toBe(200);

        expect(countOccurrences(res.text, errorMessage)).toBe(2);
      });

      describe("Selecting no more general partners", () => {
        it("should redirect to the limited partners page - no LPs", async () => {
          const res = await request(app).post(getUrl(config.url)).send({
            pageType: config.pageType.reviewGeneralPartners,
            add_another_partner: "no"
          });

          expect(res.status).toBe(302);

          expect(res.headers.location).toContain(getUrl(config.redirectUrls.limitedPartners));
        });

        it("should redirect to the review limited partners page - LPs", async () => {
          const limitedPartner = new LimitedPartnerBuilder().isPerson().build();
          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

          const res = await request(app).post(getUrl(config.url)).send({
            pageType: config.pageType.reviewGeneralPartners,
            add_another_partner: "no"
          });

          expect(res.status).toBe(302);
          expect(res.headers.location).toContain(getUrl(config.redirectUrls.reviewLimitedPartners));
        });

        it.each([
          [""],
          ["no"],
          ["addPerson"],
          ["addLegalEntity"],
        ])("should render the review general partners page with errors - add_another_partner = %s ", async (addAnotherPartner: string) => {
          const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
          const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().withCompleted(false).build();
          appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

          const res = await request(app).post(getUrl(config.url)).send({
            pageType: config.pageType.reviewGeneralPartners,
            add_another_partner: addAnotherPartner
          });

          expect(res.status).toBe(200);

          expect(res.text).toContain(
            `${enTranslationText.errorMessages.reviewGeneralPartnersPage.beforeName} ${generalPartnerLegalEntity?.data?.legal_entity_name} ${enTranslationText.errorMessages.reviewGeneralPartnersPage.afterName}`
          );
        });
      });
    });
  });
};
