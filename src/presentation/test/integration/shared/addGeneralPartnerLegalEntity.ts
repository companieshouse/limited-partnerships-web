import request from "supertest";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { ApiErrors } from "../../../../domain/entities/UIErrors";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import TransactionLimitedPartnership from "../../../../domain/entities/TransactionLimitedPartnership";

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
  serviceTitleTranslationKey: string;
};

export const runAddGeneralPartnerLegalEntityTests = (config: AddGeneralPartnerLegalEntityTestConfig): void => {

  describe("Add General Partner Legal Entity Page", () => {

    let limitedPartnership: TransactionLimitedPartnership;

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
      appDevDependencies.generalPartnerGateway.feedErrors();
    });

    describe("Get Add General Partner Legal Entity Page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])("should load the add general partner legal entity page with English text", async (_description: string, lang: string, translationText: Record<string, any>) => {

        const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.partner.addOrUpdatePartnerLegalEntityPage.generalPartner.title} - ${translationText[config.serviceTitleTranslationKey]} - GOV.UK`
        );

        const partnershipName = config.serviceTitleTranslationKey === "serviceTransition" ? `${limitedPartnership?.data?.partnership_name?.toUpperCase()} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})` : limitedPartnership?.data?.partnership_name?.toUpperCase();
        expect(res.text).toContain(partnershipName);

        testTranslations(res.text, translationText.partner.addOrUpdatePartnerLegalEntityPage, config.translateExcludeAddOrUpdatePartnerLegalEntityPage);
        testTranslations(res.text, translationText.partner.generalPartnersPage, config.translateExcludeGeneralPartnersPage);

        const BACK_LINK = `${getUrl(config.baseUrlWithIds)}/${config.pageType.generalPartnerType}`;

        const regex = new RegExp(BACK_LINK);
        expect(res.text).toMatch(regex);
      });

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

        // expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
        // expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
        //   "Add a general partner (legal entity)"
        // );

        // expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
        // expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(
        //   PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY
        // );
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
