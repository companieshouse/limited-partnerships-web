import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
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
import { OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY } from "../../../../../config";

describe("Update General Partner Legal Entity Page", () => {
  const URL = getUrl(UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_URL);
  const URL_WITH_IDS = getUrl(UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL);
  const REDIRECT = getUrl(UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);

  let companyProfile;
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
    ])("should load the update general partner legal entity page with %s text", async (description: string, lang: string, translationText: any) => {
      setLocalesEnabled(true);

      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, translationText.addOrUpdatePartnerLegalEntityPage, [
        "title",
        "limitedPartner",
        "errorMessages",
        "dateEffectiveFrom",
        "dateHint",
        "dateDay",
        "dateMonth",
        "dateYear"
      ]);

      expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateGeneralPartnerLegalEntity))).toBe(2);

      if (lang === "cy") {
        expect(res.text).toContain("WELSH - ");
      } else {
        expect(res.text).not.toContain("WELSH -");
      }
    });

    it.each([
      ["with appointment id", URL],
      ["with general partner id", URL_WITH_IDS]
    ])("should load the update general partner legal entity page and replay saved data %s", async (description: string, url: string) => {
      if (url.includes("/appointment/")) {
        companyAppointment = new CompanyAppointmentBuilder()
          .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY)
          .isLegalEntity()
          .withName("My Company ltd - GP")
          .build();
        appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);
      } else {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isLegalEntity()
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([
          generalPartner,
        ]);
      }

      setLocalesEnabled(true);
      const res = await request(app).get(url);

      expect(res.status).toBe(200);
      expect(res.text).toContain("My Company ltd - GP");
      expect(res.text).toContain("Limited Company");
      expect(res.text).toContain("Act of law");
      expect(res.text).toContain("US Register");
      expect(res.text).toContain("12345678");
      expect(res.text).toContain('<option value="United States" selected>United States</option>');
    });
  });

  describe("POST update general partner legal entity page", () => {
    it.each([
      ["with appointment id", URL],
      ["with general partner id", URL_WITH_IDS],
    ])("should send the general partner legal entity details to API %s", async (_description: string, url: string) => {
      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(0);

      if (url.includes("/general-partner/")) {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isLegalEntity()
          .withNotDisqualifiedStatementChecked(true)
          .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY)
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([
          generalPartner,
        ]);
      }

      const res = await request(app).post(url).send({
        pageType: PostTransitionPageType.updateGeneralPartnerLegalEntity,
        "legal_entity_name": "MY LP",
        "legal_form": "form",
        "governing_law": "British",
        "legal_entity_register_name": "Irish",
        "legal_entity_registration_location": "England",
        "registered_company_number": "12345678",
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
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.legal_entity_registration_location).toEqual("England");
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.registered_company_number).toEqual("12345678");
    });

    it("should replay entered data when a validation error occurs", async () => {
      const apiErrors: ApiErrors = {
        errors: { legal_entity_name: "legal entity name is invalid" }
      };
      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.updateGeneralPartnerLegalEntity,
        "legal_entity_name": "MY LP",
        "legal_form": "form",
        "governing_law": "British",
        "legal_entity_register_name": "Irish",
        "legal_entity_registration_location": "Iceland",
        "registered_company_number": "12345678",
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

});
