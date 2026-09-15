import request from "supertest";

import app from "../app";
import { toEscapedHtml } from "../../utils";
import * as enErrors from "../../../../../locales/en/errors.json";
import * as cyErrors from "../../../../../locales/cy/errors.json";

type LegalEntityValidationTestConfig = {
  url: string;
  pageData: Record<string, unknown>;
  additionalData?: Record<string, unknown>;
  beforeEach?: () => void;
};

export const runLegalEntityValidationTests = ({
  url,
  pageData,
  additionalData = {},
  beforeEach: setupValidation
}: LegalEntityValidationTestConfig): void => {
  describe.each([
    ["English", "en", enErrors],
    ["Welsh", "cy", cyErrors]
  ])("Validation - %s", (_language, language, errors) => {
    const validLegalEntity = {
      ...pageData,
      ...additionalData,
      legal_entity_name: "My Company ltd",
      legal_form: "Limited Company",
      governing_law: "Act of law",
      legal_entity_register_name: "US Register",
      legal_entity_registration_location: "United States",
      registered_company_number: "12345678"
    };

    beforeEach(() => {
      setupValidation?.();
    });

    it("should return all missing validation errors", async () => {
      const res = await request(app).post(`${url}?lang=${language}`).send({
        ...pageData,
        ...additionalData
      });

      expect(res.status).toBe(200);

      const errorMessages = [
        errors.errorMessages.partners.addPartner.legalEntityNameMissing,
        errors.errorMessages.partners.addPartner.legalFormMissing,
        errors.errorMessages.partners.addPartner.governingLawMissing,
        errors.errorMessages.partners.addPartner.legalEntityRegisterNameMissing,
        errors.errorMessages.partners.addPartner.registeredCompanyNumberMissing,
        errors.errorMessages.partners.addPartner.legalEntityCountryRegisteredMissing
      ];

      errorMessages.forEach((errorMessage) => {
        expect(res.text).toContain(toEscapedHtml(errorMessage));
      });
    });

    it.each([
      ["legal_entity_name", errors.errorMessages.partners.addPartner.legalEntityNameInvalid],
      ["legal_form", errors.errorMessages.partners.addPartner.legalFormInvalid],
      ["governing_law", errors.errorMessages.partners.addPartner.governingLawInvalid],
      ["legal_entity_register_name", errors.errorMessages.partners.addPartner.legalEntityRegisterNameInvalid],
      ["registered_company_number", errors.errorMessages.partners.addPartner.registeredCompanyNumberInvalid]
    ])("should return an invalid-character error when %s contains invalid characters", async (field, errorMessage) => {
      const res = await request(app).post(`${url}?lang=${language}`).send({
        ...validLegalEntity,
        [field]: "Invalid ™ characters"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(errorMessage));
    });

    it.each([
      ["legal_entity_name", errors.errorMessages.partners.addPartner.legalEntityNameTooLong],
      ["legal_form", errors.errorMessages.partners.addPartner.legalFormTooLong],
      ["governing_law", errors.errorMessages.partners.addPartner.governingLawTooLong],
      ["legal_entity_register_name", errors.errorMessages.partners.addPartner.legalEntityRegisterNameTooLong],
      ["registered_company_number", errors.errorMessages.partners.addPartner.registeredCompanyNumberTooLong]
    ])("should return a maximum-length error when %s exceeds 160 characters", async (field, errorMessage) => {
      const res = await request(app).post(`${url}?lang=${language}`).send({
        ...validLegalEntity,
        [field]: "a".repeat(161)
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(errorMessage));
    });
  });
};
