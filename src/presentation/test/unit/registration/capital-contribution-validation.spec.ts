import UIErrors from "../../../../domain/entities/UIErrors";
import { capitalContributionValidation } from "../../../../application/service/utils/capitalContributionValidation";

import i18nErrorsEn from "../../../../../locales/en/errors.json";
import i18nErrorsCy from "../../../../../locales/cy/errors.json";

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
        "Contribution currency type is required"
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
      ]
    ])("should throw an error for invalid capital contribution - %s", (_description, data, field, errorMessage) => {
      let thrownError: UIErrors | null = null;

      try {
        capitalContributionValidation(data, i18nErrorsEn);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toEqual(
        expect.objectContaining({
          errors: expect.objectContaining({
            [field]: { text: errorMessage }
          })
        })
      );
    });

    it("should throw an error for invalid capital contribution - welsh", () => {
      let thrownError: UIErrors | null = null;

      try {
        capitalContributionValidation({ ...data, contribution_currency_value: "aaaa" }, i18nErrorsCy);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toEqual(
        expect.objectContaining({
          errors: expect.objectContaining({
            contribution_currency_value: { text: "WELSH - Value must be a number with 2 decimal places" }
          })
        })
      );
    });
  });
});
