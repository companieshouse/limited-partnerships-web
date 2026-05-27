import { Jurisdiction, NameEndingType, PartnershipType, Term } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import LimitedPartnership from "../../../../domain/validator/LimitedPartnership";
import enTranslationText from "../../../../../locales/en/errors.json";

describe("Limited Partnership Validation", () => {
  describe("Partnership Type validation", () => {
    it("should not return an error if partnership type is valid", () => {
      const limitedPartnership = new LimitedPartnership().set({ partnership_type: PartnershipType.LP }, enTranslationText);
      const errors = limitedPartnership.runPartnershipTypeValidation();

      expect(errors.hasErrors()).toBe(false);
      expect(errors.getErrors()).toEqual({ errorList: [] });
    });

    it("should return an error if partnership type is empty", () => {
      const limitedPartnership = new LimitedPartnership().set({}, enTranslationText);
      const errors = limitedPartnership.runPartnershipTypeValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        partnership_type: {
          text: enTranslationText.errorMessages.limitedPartnership.partnershipType.typeRequired
        },
        errorList: [
          {
            href: "#partnership_type",
            text: enTranslationText.errorMessages.limitedPartnership.partnershipType.typeRequired
          }
        ]
      });
    });

    it("should return an error if partnership type is invalid", () => {
      const limitedPartnership = new LimitedPartnership().set({ partnership_type: "invalid" }, enTranslationText);
      const errors = limitedPartnership.runPartnershipTypeValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors ()).toEqual({
        partnership_type: {
          text: enTranslationText.errorMessages.limitedPartnership.partnershipType.typeRequired
        },
        errorList: [
          {
            href: "#partnership_type",
            text: enTranslationText.errorMessages.limitedPartnership.partnershipType.typeRequired
          }
        ]
      });
    });
  });

  describe("Name validation", () => {
    it.each([
      ["Valid Name", NameEndingType.LP],
      ["A".repeat(157) + " ", NameEndingType.LP]
    ])("should not return an error if name is valid", (name, nameEnding) => {
      const limitedPartnership = new LimitedPartnership().set({ partnership_name: name, name_ending: nameEnding }, enTranslationText);
      const errors = limitedPartnership.runNameValidation();

      expect(errors.hasErrors()).toBe(false);
      expect(errors.getErrors()).toEqual({ errorList: [] });
    });

    it("should return an error if name or name ending is empty", () => {
      const limitedPartnership = new LimitedPartnership().set({ partnership_name: " ", name_ending: "" }, enTranslationText);
      const errors = limitedPartnership.runNameValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        partnership_name: {
          text: enTranslationText.errorMessages.limitedPartnership.name.nameRequired
        },
        name_ending: {
          text: enTranslationText.errorMessages.limitedPartnership.name.nameEndingRequired
        },
        errorList: [
          {
            href: "#partnership_name",
            text: enTranslationText.errorMessages.limitedPartnership.name.nameRequired
          },
          {
            href: "#name_ending",
            text: enTranslationText.errorMessages.limitedPartnership.name.nameEndingRequired
          }
        ]
      });
    });

    it("should return an error if name contains invalid characters", () => {
      const limitedPartnership = new LimitedPartnership().set({ partnership_name: "Invalid_Name", name_ending: NameEndingType.LP }, enTranslationText);
      const errors = limitedPartnership.runNameValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        partnership_name: {
          text: enTranslationText.errorMessages.limitedPartnership.name.nameInvalid
        },
        errorList: [
          {
            href: "#partnership_name",
            text: enTranslationText.errorMessages.limitedPartnership.name.nameInvalid
          }
        ]
      });
    });

    it("should return an error if name with ending is too long", () => {
      const limitedPartnership = new LimitedPartnership().set({ partnership_name: "A".repeat(158), name_ending: NameEndingType.LP }, enTranslationText);
      const errors = limitedPartnership.runNameValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        partnership_name: {
          text: enTranslationText.errorMessages.limitedPartnership.name.nameLength
        },
        errorList: [
          {
            href: "#partnership_name",
            text: enTranslationText.errorMessages.limitedPartnership.name.nameLength
          }
        ]
      });
    });
  });

  describe("Jurisdiction validation", () => {
    it("should not return an error if jurisdiction is valid", () => {
      const limitedPartnership = new LimitedPartnership().set({ jurisdiction: Jurisdiction.ENGLAND_AND_WALES }, enTranslationText);
      const errors = limitedPartnership.runJurisdictionValidation();

      expect(errors.hasErrors()).toBe(false);
      expect(errors.getErrors()).toEqual({ errorList: [] });
    });

    it("should return an error if jurisdiction is empty", () => {
      const limitedPartnership = new LimitedPartnership().set({}, enTranslationText);
      const errors = limitedPartnership.runJurisdictionValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        jurisdiction: {
          text: enTranslationText.errorMessages.limitedPartnership.jurisdiction.required
        },
        errorList: [
          {
            href: "#jurisdiction",
            text: enTranslationText.errorMessages.limitedPartnership.jurisdiction.required
          }
        ]
      });
    });

    it("should return an error if jurisdiction is invalid", () => {
      const limitedPartnership = new LimitedPartnership().set({ jurisdiction: "invalid" }, enTranslationText);
      const errors = limitedPartnership.runJurisdictionValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        jurisdiction: {
          text: enTranslationText.errorMessages.limitedPartnership.jurisdiction.required
        },
        errorList: [
          {
            href: "#jurisdiction",
            text: enTranslationText.errorMessages.limitedPartnership.jurisdiction.required
          }
        ]
      });
    });
  });

  describe("Term validation", () => {
    it("should not return an error if term is valid", () => {
      const limitedPartnership = new LimitedPartnership().set({ term: Term.BY_AGREEMENT }, enTranslationText);
      const errors = limitedPartnership.runTermValidation();

      expect(errors.hasErrors()).toBe(false);
      expect(errors.getErrors()).toEqual({ errorList: [] });
    });

    it("should return an error if term is invalid", () => {
      const limitedPartnership = new LimitedPartnership().set({ term: "invalid" }, enTranslationText);
      const errors = limitedPartnership.runTermValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        term: {
          text: enTranslationText.errorMessages.limitedPartnership.term.termRequired
        },
        errorList: [
          {
            href: "#term",
            text: enTranslationText.errorMessages.limitedPartnership.term.termRequired
          }
        ]
      });
    });

    it("should return an error if term is empty", () => {
      const limitedPartnership = new LimitedPartnership().set({}, enTranslationText);
      const errors = limitedPartnership.runTermValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        term: {
          text: enTranslationText.errorMessages.limitedPartnership.term.termRequired
        },
        errorList: [
          {
            href: "#term",
            text: enTranslationText.errorMessages.limitedPartnership.term.termRequired
          }
        ]
      });
    });
  });

  describe("Email validation", () => {
    it.each([
      ["test@example.com"],
      ["name@example.com"],
      ["first.last@sub.example.co.uk"],
      [`${"a".repeat(64)}@example.com`],
      [`test@${"a".repeat(63)}.com`]
    ])("should not return an error if email is valid: %s", (email) => {
      const limitedPartnership = new LimitedPartnership().set({ email }, enTranslationText);
      const errors = limitedPartnership.runEmailValidation();

      expect(errors.hasErrors()).toBe(false);
      expect(errors.getErrors()).toEqual({ errorList: [] });
    });

    it.each([["", "empty"], ["   ", "whitespace"]])("should return an error if email is %s", (email) => {
      const limitedPartnership = new LimitedPartnership().set({ email }, enTranslationText);
      const errors = limitedPartnership.runEmailValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        email: {
          text: enTranslationText.errorMessages.limitedPartnership.email.emailRequired
        },
        errorList: [
          {
            href: "#email",
            text: enTranslationText.errorMessages.limitedPartnership.email.emailRequired
          }
        ]
      });
    });

    it.each([
      ["plainaddress", "no @ symbol"],
      ["test@", "no domain"],
      ["test@example.", "trailing dot in domain"],
      ["test space@example.com", "contains a space"],
      [`${"a".repeat(65)}@example.com`, "local part longer than 64 characters"],
      [`test@${"a".repeat(64)}.com`, "domain label longer than 63 characters"],
      [`${"a".repeat(250)}@${"b".repeat(60)}.com`, "longer than 255 characters"]
    ])("should return an error if email is invalid: %s", (email) => {
      const limitedPartnership = new LimitedPartnership().set({ email }, enTranslationText);
      const errors = limitedPartnership.runEmailValidation();

      expect(errors.hasErrors()).toBe(true);
      expect(errors.getErrors()).toEqual({
        email: {
          text: enTranslationText.errorMessages.limitedPartnership.email.emailInvalid
        },
        errorList: [
          {
            href: "#email",
            text: enTranslationText.errorMessages.limitedPartnership.email.emailInvalid
          }
        ]
      });
    });
  });
});
