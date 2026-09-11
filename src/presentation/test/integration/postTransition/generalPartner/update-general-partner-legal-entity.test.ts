import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import request from "supertest";

import app from "../../app";
import {
  UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL
} from "../../../../controller/postTransition/url";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import GeneralPartnerBuilder from "../../../../../presentation/test/builder/GeneralPartnerBuilder";
import PostTransitionPageType from "../../../../../presentation/controller/postTransition/pageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import { OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY, YOUR_COMPANY_OFFICERS_URL } from "../../../../../config";
import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
import * as enErrors from "../../../../../../locales/en/errors.json";
import * as cyErrors from "../../../../../../locales/cy/errors.json";

describe("Update General Partner Legal Entity Page", () => {
  const URL = getUrl(UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_URL);
  const URL_WITH_IDS = getUrl(UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL);
  const REDIRECT = getUrl(UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);
  const BACK_LINK = getUrl(YOUR_COMPANY_OFFICERS_URL);

  let companyProfile: { _id: string; data: Partial<CompanyProfile> };
  let companyAppointment;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.companyGateway.feedCompanyAppointments([]);
  });

  describe("GET update general partner legal entity page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the update general partner legal entity page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
        );

        testTranslations(res.text, translationText.partner.addOrUpdatePartnerLegalEntityPage, [
          "title",
          "limitedPartner",
          "errorMessages",
          "dateEffectiveFrom",
          "dateHint",
          "dateDay",
          "dateMonth",
          "dateYear"
        ]);

        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateGeneralPartnerLegalEntity))).toBe(4);

        if (lang === "cy") {
          expect(res.text).toContain("WELSH - ");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }
        expect(res.text).toContain(customerFeedbackUrlMap.updateGeneralPartnerLegalEntity);
        expect(res.text).toContain(BACK_LINK);

        expect(res.text).toContain(translationText.buttons.continue);
      }
    );

    it("should load the update general partner legal entity page and replay company appointment data", async () => {
      companyAppointment = new CompanyAppointmentBuilder()
        .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY)
        .isLegalEntity()
        .build();
      appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(companyAppointment.name);
      expect(res.text).toContain(companyAppointment.identification?.legalForm);
      expect(res.text).toContain(companyAppointment.identification?.legalAuthority);
      expect(res.text).toContain(companyAppointment.identification?.placeRegistered);
      expect(res.text).toContain(companyAppointment.identification?.registrationNumber);
      expect(res.text).toContain(
        `<option value="${companyAppointment.identification?.registerLocation}" selected>${companyAppointment.identification?.registerLocation}</option>`
      );
    });

    it("should load the update general partner legal entity page and replay general partner data", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL_WITH_IDS);

      expect(res.status).toBe(200);

      expect(res.text).toContain(generalPartner.data?.legal_entity_name);
      expect(res.text).toContain(generalPartner.data?.legal_form);
      expect(res.text).toContain(generalPartner.data?.governing_law);
      expect(res.text).toContain(generalPartner.data?.legal_entity_register_name);
      expect(res.text).toContain(generalPartner.data?.registered_company_number);
      expect(res.text).toContain(
        `<option value="${generalPartner.data?.legal_entity_registration_location}" selected>${generalPartner.data?.legal_entity_registration_location}</option>`
      );
    });
  });

  describe("POST update general partner legal entity page", () => {
    it.each([
      ["with appointment id", URL],
      ["with general partner id", URL_WITH_IDS]
    ])("should send the general partner legal entity details to API %s", async (description: string, url: string) => {
      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(0);

      if (url.includes("/general-partner/")) {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isLegalEntity()
          .withNotDisqualifiedStatementChecked(true)
          .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY)
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
      }

      const res = await request(app).post(url).send({
        pageType: PostTransitionPageType.updateGeneralPartnerLegalEntity,
        legal_entity_name: "MY LP",
        legal_form: "form",
        governing_law: "British",
        legal_entity_register_name: "Irish",
        legal_entity_registration_location: "England",
        registered_company_number: "12345678"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(
        PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY
      );
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.legal_entity_name).toEqual("MY LP");
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.legal_form).toEqual("form");
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.governing_law).toEqual("British");
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.legal_entity_register_name).toEqual("Irish");
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.legal_entity_registration_location).toEqual(
        "England"
      );
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.registered_company_number).toEqual("12345678");
    });

    it("should replay entered data when a validation error occurs", async () => {
      const apiErrors: ApiErrors = {
        errors: { legal_entity_name: "legal entity name is invalid" }
      };
      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.updateGeneralPartnerLegalEntity,
        legal_entity_name: "MY LP",
        legal_form: "form",
        governing_law: "British",
        legal_entity_register_name: "Irish",
        legal_entity_registration_location: "Iceland",
        registered_company_number: "12345678"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("legal entity name is invalid");
      expect(res.text).toContain("MY LP");
      expect(res.text).toContain("form");
      expect(res.text).toContain("British");
      expect(res.text).toContain("Irish");
      expect(res.text).toContain('<option value="Iceland" selected>Iceland</option>');
    });
  });

  describe.each([
    ["English", "en", enErrors],
    ["Welsh", "cy", cyErrors]
  ])("Field validation - %s", (_language, language, errors) => {
    const validLegalEntity = {
      pageType: PostTransitionPageType.updateGeneralPartnerLegalEntity,
      legal_entity_name: "MY LP",
      legal_form: "form",
      governing_law: "British",
      legal_entity_register_name: "Irish",
      legal_entity_registration_location: "England",
      registered_company_number: "12345678"
    };

    beforeEach(() => {
      setLocalesEnabled(true);
    });

    it("should return all missing validation errors", async () => {
      const res = await request(app).post(`${URL}?lang=${language}`).send({
        pageType: PostTransitionPageType.updateGeneralPartnerLegalEntity
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
      const res = await request(app).post(`${URL}?lang=${language}`).send({
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
      const res = await request(app).post(`${URL}?lang=${language}`).send({
        ...validLegalEntity,
        [field]: "a".repeat(161)
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(errorMessage));
    });
  });
});
