import request from "supertest";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

import { getServiceTitle, isPostTransition } from "../utils";

import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";

import { PagesRouting } from "../../../../controller/PageRouting";
import PageType from "../../../../controller/PageType";

type AddLimitedPartnerLegalEntityTestConfig = {
  url: string;
  urlWithIds: string;
  pageType: {
    addLimitedPartnerLegalEntity: string;
    reviewLimitedPartners: string;
    limitedPartnerType: string;
  };
  pageRouting: PagesRouting;
  redirectUrl: string;
  confirmRedirectUrl: string;
  baseUrlWithIds: string;
  translateExclude: string[];
  serviceTitleTranslationKey: string | { serviceName: string };
  partnerKind?: string;
};

export const runAddLimitedPartnerLegalEntityTests = (config: AddLimitedPartnerLegalEntityTestConfig) => {
  let limitedPartnership: TransactionLimitedPartnership;
  let companyProfile: {
      _id: string;
      data: Partial<CompanyProfile>;
    };

  const datesBody = isPostTransition(config.serviceTitleTranslationKey) ? { "date_effective_from-day": "01", "date_effective_from-month": "11", "date_effective_from-year": "2024" } : {};

  const limitedPartner = new LimitedPartnerBuilder()
    .isLegalEntity()
    .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
    .withAppointmentId(appDevDependencies.limitedPartnerGateway.limitedPartnerAppointmentId)
    .withKind(config.partnerKind ?? "")
    .build();

  describe("Add Limited Partner Legal Entity Page", () => {

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.LP).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      appDevDependencies.transactionGateway.feedTransactions([]);
    });

    describe("Get Add Limited Partner Page", () => {
      it.each([
        ["for type LP - english", PartnershipType.LP, true, "en", enTranslationText],
        ["for type LP - welsh", PartnershipType.LP, true, "cy", cyTranslationText],
        ["for type SLP - english", PartnershipType.SLP, true, "en", enTranslationText],
        ["for type SLP - welsh", PartnershipType.SLP, true, "cy", cyTranslationText],
        ["for type PFLP - english", PartnershipType.PFLP, false, "en", enTranslationText],
        ["for type PFLP - welsh", PartnershipType.PFLP, false, "cy", cyTranslationText],
        ["for type SPFLP - english", PartnershipType.SPFLP, false, "en", enTranslationText],
        ["for type SPFLP - welsh", PartnershipType.SPFLP, false, "cy", cyTranslationText]
      ])(
        "should load the add limited partner legal entity page %s with Welsh text",
        async (_description: string, partnershipType: PartnershipType, isCapitalContributionPresent: boolean, lang: string, translationText: Record<string, any>) => {

          const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
          appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

          const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

          expect(res.status).toBe(200);

          expect(res.text).toContain(
            `${translationText.partner.addOrUpdatePartnerLegalEntityPage.limitedPartner.title} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
          );

          let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
          if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
            partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
          } else if (isPostTransition(config.serviceTitleTranslationKey)) {
            partnershipName = `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`;
          }

          expect(res.text).toContain(partnershipName);

          testTranslations(res.text, translationText.partner.addOrUpdatePartnerLegalEntityPage, config.translateExclude);

          if (!isCapitalContributionPresent) {
            expect(res.text).not.toContain(translationText.partner.capitalContribution.title);
          }

          if (isPostTransition(config.serviceTitleTranslationKey)) {
            expect(res.text).toContain(customerFeedbackUrlMap.addLimitedPartner);
          }
        }
      );

      it("should contain a back link to the review page when limited partners are present", async () => {
        const res = await request(app).get(getUrl(config.urlWithIds));

        expect(res.status).toBe(200);

        expect(res.text).toContain(limitedPartner?.data?.legal_entity_name);

        const BACK_LINK = `${getUrl(config.baseUrlWithIds)}/${config.pageType.reviewLimitedPartners}`;

        const regex = new RegExp(BACK_LINK);
        expect(res.text).toMatch(regex);
      });

      it("should contain a back link to the choice page when limited partners are not present", async () => {
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

        const res = await request(app).get(getUrl(config.url));

        expect(res.status).toBe(200);

        const BACK_LINK = `${getUrl(config.baseUrlWithIds)}/${config.pageType.limitedPartnerType}`;

        const regex = new RegExp(BACK_LINK);
        expect(res.text).toMatch(regex);
      });
    });

    describe("Post Add Limited Partner", () => {
      it("should send the Limited partner details", async () => {
        const res = await request(app)
          .post(getUrl(config.url))
          .send({
            ...config.pageRouting.get(config.pageType.addLimitedPartnerLegalEntity as PageType),
            ...limitedPartner.data,
            ...datesBody
          });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);
      });

      // validation tests skipped until proper validation logic is implemented
      it.skip("should replay entered data when invalid data is entered and a validation error occurs", async () => {
        const res = await request(app)
          .post(getUrl(config.url))
          .send({
            ...config.pageRouting.get(config.pageType.addLimitedPartnerLegalEntity as PageType),
            partnershipType: PartnershipType.LP,
            legal_entity_name: "INVALID-CHARACTERS-FORENAME",
            legal_form: "Limited Company",
            governing_law: "Act of law",
            legal_entity_register_name: "US Register",
            legal_entity_registration_location: "United States",
            registered_company_number: "12345678",
            contribution_currency_value: "11111",
            contribution_currency_type: "EUR",
            contribution_sub_types: "SHARES"
          });

        expect(res.status).toBe(200);

        expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
        expect(res.text).toContain("Limited Company");
        expect(res.text).toContain("United States");
        expect(res.text).toContain("11111");
        expect(res.text).toContain("EUR");
        expect(res.text).toContain("SHARES");
      });

      if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
        it("should show localised capital contribution errors when the section is left blank for an LP", async () => {
          const res = await request(app)
            .post(`${getUrl(config.url)}`)
            .send({
              ...config.pageRouting.get(config.pageType.addLimitedPartnerLegalEntity as PageType),
              ...limitedPartner.data,
              ...datesBody,
              partnershipType: PartnershipType.LP,
              contribution_currency_type: null,
              contribution_currency_value: null,
              contribution_sub_types: []
            });

          expect(res.status).toBe(200);

          expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.currencyRequired);
          expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.valueRequired);
          expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.atLeastOneType);
        });
      }

      it("should not require capital contribution when the section is not shown (PFLP)", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.PFLP).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app)
          .post(getUrl(config.url))
          .send({
            ...config.pageRouting.get(config.pageType.addLimitedPartnerLegalEntity as PageType),
            ...limitedPartner.data,
            ...datesBody,
            partnershipType: PartnershipType.PFLP,
            contribution_currency_type: null,
            contribution_currency_value: null,
            contribution_sub_types: []
          });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);
      });
    });

    describe("Patch Add Limited Partner", () => {
      it("should send the limited partner details", async () => {
        const res = await request(app)
          .post(getUrl(config.urlWithIds))
          .send({
            ...config.pageRouting.get(config.pageType.addLimitedPartnerLegalEntity as PageType),
            ...limitedPartner.data,
            ...datesBody
          });

        expect(res.status).toBe(302);
      });

      // validation tests skipped until proper validation logic is implemented
      it.skip("should replay entered data when invalid data is entered and a validation error occurs", async () => {
        const res = await request(app).post(getUrl(config.urlWithIds)).send({
          ...config.pageRouting.get(config.pageType.addLimitedPartnerLegalEntity as PageType),
          legal_entity_name: "INVALID-CHARACTERS-FORENAME",
          legal_form: "Limited Company",
          governing_law: "Act of law",
          legal_entity_register_name: "US Register",
          legal_entity_registration_location: "United States",
          registered_company_number: "12345678"
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
        expect(res.text).toContain("Limited Company");
        expect(res.text).toContain("United States");

        expect(res.text).toContain("limited partner name is invalid");
      });

      it("should send the limited partner details and go to confirm ura address page if already saved", async () => {
        const res = await request(app)
          .post(getUrl(config.urlWithIds))
          .send({
            ...config.pageRouting.get(config.pageType.addLimitedPartnerLegalEntity as PageType),
            ...limitedPartner.data,
            ...datesBody
          });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl)}`);
      });
    });
  });
};
