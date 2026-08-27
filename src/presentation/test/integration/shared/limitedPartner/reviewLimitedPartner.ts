import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

type ReviewLimitedPartnersTestConfig = {
  url: string;
  pageType: {
    reviewLimitedPartners: string;
  };
  redirectUrls: {
    limitedPartners: string;
    generalPartners: string;
    addLimitedPartnerPerson: string;
    addLimitedPartnerLegalEntity: string;
    reviewLimitedPartners: string;
    checkYourAnswers: string;
  };
  baseUrlWithIds: string;
  translateExclude: string[];
  serviceTitleTranslationKey: string;
};

export const runReviewLimitedPartnersTests = (config: ReviewLimitedPartnersTestConfig) => {
  describe("Review Limited Partners Page", () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();
    const companyProfile = new CompanyProfileBuilder().build();

    const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
    const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().build();

    beforeEach(() => {
      setLocalesEnabled(true);

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships(limitedPartnership);
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);
    });

    describe("Get Review Limited Partners Page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should load the review limited partners page with %s text",
        async (_description: string, lang: string, translationText: Record<string, any>) => {
          const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
          const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().withCompleted(false).build();

          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

          const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

          expect(res.status).toBe(200);

          expect(res.text).toContain(
            `${translationText.partner.reviewLimitedPartnersPage.title} - ${translationText[config.serviceTitleTranslationKey]} - GOV.UK`
          );

          testTranslations(res.text, translationText.partner.reviewLimitedPartnersPage, ["emptyList"]);

          expect(res.text).toContain(`${limitedPartnerPerson?.data?.forename} ${limitedPartnerPerson?.data?.surname}`);
          expect(res.text).toContain(`${limitedPartnerLegalEntity?.data?.legal_entity_name}`);
          expect(res.text).toContain(
            `${translationText.errorMessages.reviewGeneralPartnersPage.beforeName} ${limitedPartnerLegalEntity?.data?.legal_entity_name} ${translationText.errorMessages.reviewGeneralPartnersPage.afterName}`
          );

          const regex = new RegExp(getUrl(config.redirectUrls.reviewLimitedPartners));

          expect(res.text).toMatch(regex);
        }
      );

      describe("Empty list", () => {
        it("should redirect to limited partners start page when list is empty", async () => {
          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

          const res = await request(app).get(getUrl(config.url));

          expect(res.status).toBe(302);

          const redirectUrl = getUrl(config.redirectUrls.limitedPartners);
          expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
        });
      });
    });

    describe("Post Review Limited Partners Page", () => {
      it.each([
        ["addPerson", config.redirectUrls.addLimitedPartnerPerson],
        ["addLegalEntity", config.redirectUrls.addLimitedPartnerLegalEntity]
      ])(
        "should redirect to the Add Limited Partner Person or Legal Entity page when %s is selected",
        async (addAnotherPartner: string, redirectUrl: string) => {
          const res = await request(app).post(getUrl(config.url)).send({
            pageType: config.pageType.reviewLimitedPartners,
            add_another_partner: addAnotherPartner
          });

          expect(res.status).toBe(302);

          expect(res.headers.location).toContain(getUrl(redirectUrl));
        }
      );

      it("should redirect to the check your answers page", async () => {
        const res = await request(app).post(getUrl(config.url)).send({
          pageType: config.pageType.reviewLimitedPartners,
          add_another_partner: "no"
        });

        expect(res.status).toBe(302);

        expect(res.headers.location).toContain(getUrl(config.redirectUrls.checkYourAnswers));
      });

      it("should reload the page if no limited partner", async () => {
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

        const res = await request(app).post(getUrl(config.url)).send({
          pageType: config.pageType.reviewLimitedPartners,
          add_another_partner: "no"
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${enTranslationText.partner.reviewLimitedPartnersPage.title} - ${enTranslationText[config.serviceTitleTranslationKey]} - GOV.UK`
        );
      });

      it.each([[""], ["no"], ["addPerson"], ["addLegalEntity"]])(
        "should render the review limited partners page with errors - %s",
        async (addAnotherPartner: string) => {
          const limitedPartnerPerson = new LimitedPartnerBuilder().isPerson().build();
          const limitedPartnerLegalEntity = new LimitedPartnerBuilder().isLegalEntity().withCompleted(false).build();

          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

          const res = await request(app).post(getUrl(config.url)).send({
            pageType: config.pageType.reviewLimitedPartners,
            add_another_partner: addAnotherPartner
          });

          expect(res.status).toBe(200);

          expect(res.text).toContain(
            `${enTranslationText.errorMessages.reviewGeneralPartnersPage.beforeName} ${limitedPartnerLegalEntity?.data?.legal_entity_name} ${enTranslationText.errorMessages.reviewGeneralPartnersPage.afterName}`
          );
        }
      );

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])(
        "%s: should trigger GDS validation error when no option is selected",
        async (lang: string, errors: Record<string, any>) => {
          setLocalesEnabled(true);

          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              pageType: config.pageType.reviewLimitedPartners
            });

          expect(res.status).toBe(200);

          expect(countOccurrences(res.text, errors.errorMessages.reviewPartners.limitedPartner)).toBe(2);
        }
      );
    });
  });
};
