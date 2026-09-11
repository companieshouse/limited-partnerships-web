import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL
} from "../../../../controller/registration/url";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock from "../../mock/sdkMock";
import appRealDependencies from "../../../../../app";
import * as enErrors from "../../../../../../locales/en/errors.json";
import * as cyErrors from "../../../../../../locales/cy/errors.json";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Add General Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL);

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  describe("200", () => {
    it("should add a general partner legal entity", async () => {
      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerLegalEntity,
        legal_entity_name: "My Company ltd - GP",
        legal_form: "Limited Company",
        governing_law: "Act of law",
        legal_entity_register_name: "US Register",
        legal_entity_registration_location: "United States",
        registered_company_number: "12345678",
        "date_effective_from-day": "01",
        "date_effective_from-month": "01",
        "date_effective_from-year": "2024",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(302);
    });

    it("should update a general partner person", async () => {
      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL);

      const res = await request(appRealDependencies).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "Joe",
        surname: "Doe",
        "date_of_birth-day": "01",
        "date_of_birth-month": "01",
        "date_of_birth-year": "2001",
        "date_effective_from-day": "01",
        "date_effective_from-month": "01",
        "date_effective_from-year": "2024",
        nationality1: "BRITISH",
        former_names: "previous name",
        previous_name: "false",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(302);
    });
  });

  describe.each([
    ["English", "en", enErrors],
    ["Welsh", "cy", cyErrors]
  ])("Validation - %s", (_language, language, errors) => {
    const validLegalEntity = {
      pageType: RegistrationPageType.addGeneralPartnerLegalEntity,
      legal_entity_name: "My Company ltd - GP",
      legal_form: "Limited Company",
      governing_law: "Act of law",
      legal_entity_register_name: "US Register",
      legal_entity_registration_location: "United States",
      registered_company_number: "12345678"
    };

    it("should return all missing validation errors", async () => {
      const res = await request(appRealDependencies).post(`${URL}?lang=${language}`).send({
        pageType: RegistrationPageType.addGeneralPartnerLegalEntity,
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
      const res = await request(appRealDependencies).post(`${URL}?lang=${language}`).send({
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
      const res = await request(appRealDependencies).post(`${URL}?lang=${language}`).send({
        ...validLegalEntity,
        [field]: "a".repeat(161)
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(errorMessage));
    });
  });
});

