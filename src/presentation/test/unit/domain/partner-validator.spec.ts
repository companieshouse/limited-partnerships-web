import PartnerValidator from "../../../../domain/validator/PartnerValidator";
import { PartnerEntityType } from "../../../../domain/types";

const mockI18n = {
  errorMessages: {
    partners: {
      addPartner: {
        firstNameMissing: "Enter the first name",
        lastNameMissing: "Enter the last name",
        previousNameNotSelected: "Select yes if the person has used another name",
        formerNamesMissing: "Enter former names",
        nationality1Missing: "Enter nationality",
        disqualificationStatementMissingGeneralPartner: "You must confirm they are not disqualified"
      }
    },
    dateOfBirth: {
      dayMissing: "Enter a day",
      monthMissing: "Enter a month",
      yearMissing: "Enter a year",
      dateMissing: "Enter a date of birth",
      invalid: "Enter a real date of birth",
      future: "Date of birth must be in the past"
    }
  }
};

describe("PartnerValidator", () => {
  describe("delegate reset between requests", () => {
    it("should not retain the PartnerPersonValidator delegate from a previous request when partnerEntityType is not set", () => {
      const validator = new PartnerValidator();

      // Simulate first request: adding a general partner person (sets delegate)
      validator.set({ partnerEntityType: PartnerEntityType.person, forename: "John", surname: "Doe" }, mockI18n);

      // Simulate second request: cease date page (no partnerEntityType — delegate must be cleared)
      const errors = validator.set({
        "cease_date-day": "01",
        "cease_date-month": "01",
        "cease_date-year": "2025",
        remove_confirmation_checked: "true"
      }, mockI18n).runValidation();

      expect(errors.hasErrors()).toBe(false);
    });

    it("should run PartnerPersonValidator when partnerEntityType is person", () => {
      const validator = new PartnerValidator();

      // Missing required person fields — should produce validation errors
      const errors = validator.set({ partnerEntityType: PartnerEntityType.person }, mockI18n).runValidation();

      expect(errors.hasErrors()).toBe(true);
    });

    it("should not run validation when partnerEntityType is undefined", () => {
      const validator = new PartnerValidator();

      const errors = validator.set({
        "cease_date-day": "01",
        "cease_date-month": "01",
        "cease_date-year": "2025"
      }, mockI18n).runValidation();

      expect(errors.hasErrors()).toBe(false);
    });
  });
});
