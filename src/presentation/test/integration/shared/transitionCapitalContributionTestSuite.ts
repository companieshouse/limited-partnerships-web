import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { enTranslationText } from "../../../../test/utils/locales";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";

type TransitionCapitalContributionTestConfig = {
  url: string;
  redirectUrl: string;
  pageData: Record<string, unknown>;
};

export const runTransitionCapitalContributionTests = ({
  url,
  redirectUrl,
  pageData
}: TransitionCapitalContributionTestConfig): void => {
  describe.each([PartnershipType.LP, PartnershipType.SLP])("Transition capital contribution - %s", (partnershipType) => {
    beforeEach(() => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
    });

    it("should not require capital contribution when the section is left blank", async () => {
      const res = await request(app)
        .post(url)
        .send({
          ...pageData,
          partnershipType,
          contribution_currency_type: "",
          contribution_currency_value: "",
          contribution_sub_types: undefined
        });

      expect(res.status).toBe(302);

      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should validate capital contribution when the section is partially completed", async () => {
      const res = await request(app)
        .post(url)
        .send({
          ...pageData,
          partnershipType,
          contribution_currency_type: "",
          contribution_currency_value: "100.00",
          contribution_sub_types: undefined
        });

      expect(res.status).toBe(200);

      expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.currencyRequired);
      expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.atLeastOneType);
      expect(res.text).not.toContain(enTranslationText.errorMessages.capitalContribution.valueRequired);
    });
  });
};
