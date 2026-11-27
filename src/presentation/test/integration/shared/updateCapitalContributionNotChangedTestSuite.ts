import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { OFFICER_ROLE_LIMITED_PARTNER_LEGAL_ENTITY, OFFICER_ROLE_LIMITED_PARTNER_PERSON } from "../../../../config";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";
import { countOccurrences, toEscapedHtml } from "../../utils";
import CompanyAppointmentBuilder from "../../builder/CompanyAppointmentBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";

type UpdateCapitalContributionNotChangedTestConfig = {
  url: string;
  redirectUrl: string;
  pageType: string;
  isPerson: boolean;
};

export const runUpdateCapitalContributionNotChangedTests = ({
  url,
  redirectUrl,
  pageType,
  isPerson
}: UpdateCapitalContributionNotChangedTestConfig): void => {
  describe("when the capital contribution is compared with the appointment", () => {
    const appointmentSubTypes = ["MONEY", "LAND_OR_PROPERTY", "SHARES", "SERVICES_OR_GOODS", "ANY_OTHER_ASSET"];
    const unchangedData = {
      pageType,
      partnershipType: PartnershipType.LP,
      contribution_currency_type: "Pound Sterling (GBP)",
      contribution_currency_value: "1000.00",
      // different order to the appointment, to check order is ignored
      contribution_sub_types: [...appointmentSubTypes].reverse()
    };

    const buildPartner = (appointmentId?: string) => {
      const builder = new LimitedPartnerBuilder().withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId);

      if (isPerson) {
        builder.isPerson();
      } else {
        builder.isLegalEntity();
      }

      if (appointmentId) {
        builder.withAppointmentId(appointmentId);
      }

      return builder.build();
    };

    beforeEach(() => {
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([buildPartner("AP123456")]);

      const appointmentBuilder = isPerson
        ? new CompanyAppointmentBuilder().isPerson()
        : new CompanyAppointmentBuilder().isLegalEntity();

      const companyAppointment = appointmentBuilder
        .withAppointmentId("AP123456")
        .withOfficerRole(isPerson ? OFFICER_ROLE_LIMITED_PARTNER_PERSON : OFFICER_ROLE_LIMITED_PARTNER_LEGAL_ENTITY)
        .build();
      appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);
    });

    it("should return an error page when the partner has no appointment id", async () => {
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([buildPartner()]);

      const res = await request(app).post(url).send(unchangedData);

      expect(res.status).toBe(500);
    });

    it.each([
      ["en", enTranslationText],
      ["cy", cyTranslationText]
    ])("should return a validation error when no details have changed - %s", async (lang: string, translationText: any) => {
      const res = await request(app)
        .post(`${url}?lang=${lang}`)
        .send({ ...unchangedData, contribution_currency_type: translationText.currencies.GBP });

      expect(res.status).toBe(200);
      const notChangedMessage = toEscapedHtml(translationText.errorMessages.capitalContribution.notChanged);
      expect(countOccurrences(res.text, notChangedMessage)).toBe(2);
      expect(res.text).toContain(`<a href="#contribution_currency_type">${notChangedMessage}</a>`);
      expect(res.text).toContain('id="contribution_currency_type-error"');
      expect(countOccurrences(res.text, "govuk-form-group--error")).toBe(1);
      expect(res.text).not.toContain('id="contribution_currency_value-error"');
      expect(res.text).not.toContain('id="contribution_sub_types-error"');
    });

    it.each([
      ["currency", { contribution_currency_type: "Euro (EUR)" }],
      ["value", { contribution_currency_value: "2000.00" }],
      ["types", { contribution_sub_types: ["MONEY"] }]
    ])("should redirect to the next page when the %s has changed", async (_field: string, change: Record<string, any>) => {
      const res = await request(app)
        .post(url)
        .send({ ...unchangedData, ...change });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
};
