import UIErrors from "../../../../domain/entities/UIErrors";
import {
  capitalContributionValidation,
  isCapitalContributionApplicable,
  shouldValidateCapitalContribution,
  validatePartnerCapitalContribution
} from "../../../../domain/validator/capitalContributionValidator";

import { PartnerType } from "../../../../domain/types";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";

describe("Gateway capital contribition validation test suite", () => {
  const data = {
    contribution_currency_type: "£",
    contribution_currency_value: "500.00",
    contribution_sub_types: ["MONEY"]
  };

  const dataKeys = Object.keys(data);

  describe("Validation tests", () => {
    it.each([
      [
        "aaaa",
        { ...data, contribution_currency_value: "aaaa" },
        dataKeys[1],
        "Value must be a number with 2 decimal places"
      ],
      [
        "123",
        { ...data, contribution_currency_value: "123" },
        dataKeys[1],
        "Value must be a number with 2 decimal places"
      ],
      [
        "1.123456",
        { ...data, contribution_currency_value: "1.123456" },
        dataKeys[1],
        "Value must be a number with 2 decimal places"
      ],
      ["000.00", { ...data, contribution_currency_value: "000.00" }, dataKeys[1], "Value must be 0.01 or more"],
      [
        "100000000.00",
        { ...data, contribution_currency_value: "100000000.00" },
        dataKeys[1],
        "The capital contribution value cannot have more than 8 digits before the decimal"
      ],
      [
        "99999999999.99",
        { ...data, contribution_currency_value: "99999999999.99" },
        dataKeys[1],
        "The capital contribution value cannot have more than 8 digits before the decimal"
      ],
      [
        "£100.00",
        { ...data, contribution_currency_value: "£100.00" },
        dataKeys[1],
        "Value must not include currency symbols like £, $ and €"
      ],
      [
        "25,000.00",
        { ...data, contribution_currency_value: "25,000.00" },
        dataKeys[1],
        "Value must not include a comma"
      ],
      [
        "contribution_currency_value empty",
        { ...data, contribution_currency_value: "" },
        dataKeys[1],
        "Enter the total value of all monetary and non-monetary contributions"
      ],
      [
        "contribution_sub_types empty array",
        { ...data, contribution_sub_types: [] },
        dataKeys[2],
        "Select at least one type of contribution"
      ],
      [
        "contribution_currency_type empty",
        { ...data, contribution_currency_type: "" },
        dataKeys[0],
        "Select the currency of the capital contribution"
      ],
      [
        "contribution_currency_type fake currency",
        { ...data, contribution_currency_type: "Fake currency (FK)" },
        dataKeys[0],
        "The currency you've entered cannot be found. You must select a currency from the list"
      ]
    ])("should throw an error for invalid capital contribution - %s", (_description, data, field, errorMessage) => {
      const uiErrors = new UIErrors();

      capitalContributionValidation(
        data,
        enTranslationText.currencies,
        () => {},
        uiErrors,
        enTranslationText.errorMessages?.capitalContribution
      );

      expect(uiErrors).toEqual(
        expect.objectContaining({
          errors: expect.objectContaining({
            [field]: { text: errorMessage }
          })
        })
      );
    });

    it.each(["0.01", "12345678.90", "99999999.98", "99999999.99", "099999999.99"])(
      "should not throw an error for a valid capital contribution value - %s",
      (contribution_currency_value) => {
        const uiErrors = new UIErrors();

        capitalContributionValidation(
          { ...data, contribution_currency_value },
          enTranslationText.currencies,
          () => {},
          uiErrors,
          enTranslationText.errorMessages?.capitalContribution
        );

        expect(uiErrors).toEqual(
          expect.objectContaining({
            errors: expect.objectContaining({})
          })
        );
      }
    );

    it("should throw an error for invalid capital contribution - welsh", () => {
      const uiErrors = new UIErrors();

      capitalContributionValidation(
        { ...data, contribution_currency_value: "aaaa" },
        enTranslationText.currencies,
        () => {},
        uiErrors,
        cyTranslationText.errorMessages?.capitalContribution
      );

      expect(uiErrors).toEqual(
        expect.objectContaining({
          errors: expect.objectContaining({
            contribution_currency_value: { text: "WELSH - Value must be a number with 2 decimal places" }
          })
        })
      );
    });
  });
});

describe("isCapitalContributionApplicable", () => {
  it.each([
    ["LP limited partner", { partnershipType: "LP", partnerType: PartnerType.limitedPartner }, true],
    ["SLP limited partner", { partnershipType: "SLP", partnerType: PartnerType.limitedPartner }, true],
    ["PFLP limited partner", { partnershipType: "PFLP", partnerType: PartnerType.limitedPartner }, false],
    ["SPFLP limited partner", { partnershipType: "SPFLP", partnerType: PartnerType.limitedPartner }, false],
    ["LP general partner", { partnershipType: "LP", partnerType: PartnerType.generalPartner }, false],
    ["missing partnership type", { partnerType: PartnerType.limitedPartner }, false],
    ["empty data", {}, false]
  ])("returns %s -> %s", (_description, data: any, expected) => {
    expect(isCapitalContributionApplicable(data.partnershipType, data.partnerType || ("" as PartnerType))).toBe(expected);
  });
});

describe("shouldValidateCapitalContribution", () => {
  const base = {
    partnershipType: "LP",
    partnerType: PartnerType.limitedPartner,
    pageType: "add-limited-partner-person"
  };

  it.each([
    ["registration with empty contribution", { ...base, journeyTypes: { isRegistration: true } }, true],
    ["post-transition with empty contribution", { ...base, journeyTypes: { isPostTransition: true } }, true],
    ["transition add page with empty contribution", { ...base, journeyTypes: { isTransition: true } }, false],
    [
      "transition add page with contribution entered",
      { ...base, journeyTypes: { isTransition: true }, contribution_currency_value: "100.00" },
      true
    ],
    ["not applicable partner type", { ...base, partnerType: PartnerType.generalPartner, journeyTypes: { isRegistration: true } }, false]
  ])("returns %s -> %s", (_description, data: any, expected) => {
    expect(shouldValidateCapitalContribution(data)).toBe(expected);
  });
});

describe("validatePartnerCapitalContribution", () => {
  const errorMessages = enTranslationText.errorMessages?.capitalContribution;
  const base = {
    partnershipType: "LP",
    partnerType: PartnerType.limitedPartner,
    pageType: "add-limited-partner-person",
    journeyTypes: { isRegistration: true }
  };

  it("should set errors when contribution is required but missing", () => {
    const uiErrors = new UIErrors();

    validatePartnerCapitalContribution({ ...base }, enTranslationText.currencies, uiErrors, errorMessages);

    expect(uiErrors.errors).toEqual(
      expect.objectContaining({
        contribution_currency_type: { text: "Select the currency of the capital contribution" },
        contribution_sub_types: { text: "Select at least one type of contribution" }
      })
    );
  });

  it("should not set errors when contribution is skipped on transition add page", () => {
    const uiErrors = new UIErrors();

    validatePartnerCapitalContribution(
      { ...base, journeyTypes: { isTransition: true } },
      enTranslationText.currencies,
      uiErrors,
      errorMessages
    );

    expect(uiErrors.hasErrors()).toBe(false);
  });

  it("should replace the currency name with its code when valid", () => {
    const uiErrors = new UIErrors();
    const data: Record<string, any> = {
      ...base,
      contribution_currency_type: "Pound Sterling (GBP)",
      contribution_currency_value: "100.00",
      contribution_sub_types: ["MONEY"]
    };

    validatePartnerCapitalContribution(data, enTranslationText.currencies, uiErrors, errorMessages);

    expect(uiErrors.hasErrors()).toBe(false);
    expect(data.contribution_currency_type).toEqual("GBP");
  });
});
