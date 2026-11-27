import request from "supertest";
import { PartnerKind, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import {

  countOccurrences,
  getUrl,
  setLocalesEnabled,
  testTranslations,
  toEscapedHtml,
} from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import {
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CAPITAL_CONTRIBUTION_URL,
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CAPITAL_CONTRIBUTION_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL
} from "../../../../controller/postTransition/url";

import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import postTransitionRouting from "../../../../controller/postTransition/routing";

describe("Update Capital Contribution Page", () => {
  const URL = getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CAPITAL_CONTRIBUTION_URL);
  const REDIRECT = getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);
  const BACK_URL = getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CAPITAL_CONTRIBUTION_YES_NO_URL);

  let limitedPartner: TransactionGeneralPartner;

  beforeEach(() => {
    setLocalesEnabled(true);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isLegalEntity()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET Update Capital Contribution Page", () => {
    it.each([
      ["English LP", PartnershipType.LP, "en", enTranslationText],
      ["Welsh LP", PartnershipType.LP, "cy", cyTranslationText],
      ["English SLP", PartnershipType.SLP, "en", enTranslationText],
      ["Welsh SLP", PartnershipType.SLP, "cy", cyTranslationText]
    ])(
      "should load the update capital contribution page with %s text",
      async (description: string, partnershipType: PartnershipType, lang: string, translationText: any) => {
        const companyProfile = new CompanyProfileBuilder().withSubtype(partnershipType).build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(limitedPartner.data?.legal_entity_name?.toUpperCase());

        testTranslations(res.text, translationText.partner.capitalContribution);
        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateLimitedPartnerLegalEntity))).toBe(
          2
        );

        expect(res.text).toContain(translationText.buttons.continue);

        expect(res.text).toContain(getUrl(BACK_URL));
      }
    );

    it.each([
      ["without decimal places", "1000", "1000.00"],
      ["with one decimal place", "1000.5", "1000.50"],
      ["with two decimal places", "1000.50", "1000.50"]
    ])(
      "should load the capital contribution value from the appointment %s",
      async (_description: string, appointmentValue: string, expectedValue: string) => {
        const partner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isLegalEntity()
          .withAppointmentId("AP123456")
          .build();
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([partner]);

        const companyAppointment = new CompanyAppointmentBuilder()
          .isLegalEntity()
          .withAppointmentId("AP123456")
          .withOfficerRole("corporate-limited-partner-in-a-limited-partnership")
          .build();
        appDevDependencies.companyGateway.feedCompanyAppointments([
          { ...companyAppointment, contributionCurrencyValue: appointmentValue }
        ]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(`value="${expectedValue}"`);
      }
    );

    it.each([
      ["PLP", PartnershipType.PFLP],
      ["SPFLP", PartnershipType.SPFLP]
    ])(
      "should redirected to usual residential address if type is %s",
      async (description: string, partnershipType: PartnershipType) => {
        const companyProfile = new CompanyProfileBuilder().withSubtype(partnershipType).build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT}`);
      }
    );
  });

  describe("POST Update Capital Contribution Page", () => {
    it("should redirect to URA yes no", async () => {
      const res = await request(app)
        .post(`${URL}`)
        .send({
          pageType: PostTransitionPageType.updateLimitedPartnerLegalEntityCapitalContribution,
          contribution_currency_type: "Pound Sterling (GBP)",
          contribution_currency_value: "100.00",
          contribution_sub_types: ["MONEY"]
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);
    });

    it("should return validation error when no data", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          ...postTransitionRouting.get(PostTransitionPageType.updateLimitedPartnerLegalEntityCapitalContribution),
          partnershipType: PartnershipType.LP
        });

      expect(res.status).toBe(200);

      expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.currencyRequired);
      expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.valueRequired);
      expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.atLeastOneType);
    });

    describe("when the capital contribution is compared with the appointment", () => {
      const appointmentSubTypes = ["MONEY", "LAND_OR_PROPERTY", "SHARES", "SERVICES_OR_GOODS", "ANY_OTHER_ASSET"];
      const unchangedData = {
        pageType: PostTransitionPageType.updateLimitedPartnerLegalEntityCapitalContribution,
        partnershipType: PartnershipType.LP,
        contribution_currency_type: "Pound Sterling (GBP)",
        contribution_currency_value: "1000.00",
        contribution_sub_types: [...appointmentSubTypes].reverse()
      };

      beforeEach(() => {
        const partner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isLegalEntity()
          .withAppointmentId("AP123456")
          .build();
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([partner]);

        const companyAppointment = new CompanyAppointmentBuilder()
          .isLegalEntity()
          .withAppointmentId("AP123456")
          .withOfficerRole("corporate-limited-partner-in-a-limited-partnership")
          .build();
        appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);
      });

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should return a validation error when no details have changed - %s", async (lang: string, translationText: any) => {
        const res = await request(app)
          .post(`${URL}?lang=${lang}`)
          .send({ ...unchangedData, contribution_currency_type: translationText.currencies.GBP });

        expect(res.status).toBe(200);
        const notChangedMessage = toEscapedHtml(translationText.errorMessages.capitalContribution.notChanged);
        expect(countOccurrences(res.text, notChangedMessage)).toBe(1);
        expect(res.text).toContain(
          `<span class="govuk-error-message govuk-!-margin-bottom-0">${notChangedMessage}</span>`
        );
        expect(res.text).not.toContain('href="#contribution_');
        expect(res.text).not.toContain("govuk-form-group--error");
        expect(res.text).not.toContain('id="contribution_currency_type-error"');
        expect(res.text).not.toContain('id="contribution_currency_value-error"');
        expect(res.text).not.toContain('id="contribution_sub_types-error"');
      });

      it.each([
        ["currency", { contribution_currency_type: "Euro (EUR)" }],
        ["value", { contribution_currency_value: "2000.00" }],
        ["types", { contribution_sub_types: ["MONEY"] }]
      ])("should redirect to the next page when the %s has changed", async (_field: string, change: Record<string, any>) => {
        const res = await request(app)
          .post(URL)
          .send({ ...unchangedData, ...change });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT}`);
      });
    });
  });
});
