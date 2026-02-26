import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { OFFICER_ROLE_LIMITED_PARTNER_LEGAL_ENTITY } from "../../../../../config";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL
} from "../../../../controller/postTransition/url";

describe("Update Limited Partner Legal Entity Page", () => {
  const URL = getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_URL);
  const URL_WITH_IDS = getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL);
  const REDIRECT = getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);

  let companyProfile;
  let companyAppointment;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.companyGateway.feedCompanyAppointments([]);
  });

  describe("GET update limited partner legal entity page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the update limited partner legal entity page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
        );

        expect(res.text).toContain(translationText.addOrUpdatePartnerLegalEntityPage.limitedPartner.updateTitle);

        testTranslations(res.text, translationText.addOrUpdatePartnerLegalEntityPage, [
          "title",
          "generalPartner",
          "errorMessages",
          "dateEffectiveFrom",
          "dateHint",
          "dateDay",
          "dateMonth",
          "dateYear"
        ]);

        expect(
          countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateLimitedPartnerLegalEntity))
        ).toBe(2);

        if (lang === "cy") {
          expect(res.text).toContain("WELSH - ");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }
      }
    );

    it("should load the update limited partner legal entity page and replay company appointment data", async () => {
      companyAppointment = new CompanyAppointmentBuilder()
        .withOfficerRole(OFFICER_ROLE_LIMITED_PARTNER_LEGAL_ENTITY)
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

    it("should load the update limited partner legal entity page and replay limited partner data", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      setLocalesEnabled(true);
      const res = await request(app).get(URL_WITH_IDS);

      expect(res.status).toBe(200);

      expect(res.text).toContain(limitedPartner.data?.legal_entity_name);
      expect(res.text).toContain(limitedPartner.data?.legal_form);
      expect(res.text).toContain(limitedPartner.data?.governing_law);
      expect(res.text).toContain(limitedPartner.data?.legal_entity_register_name);
      expect(res.text).toContain(limitedPartner.data?.registered_company_number);
      expect(res.text).toContain(
        `<option value="${limitedPartner.data?.legal_entity_registration_location}" selected>${limitedPartner.data?.legal_entity_registration_location}</option>`
      );
    });
  });

  describe("POST update limited partner legal entity page", () => {
    it.each([
      ["with appointment id", URL],
      ["with limited partner id", URL_WITH_IDS]
    ])("should send the limited partner legal entity details to API %s", async (description: string, url: string) => {
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(0);

      if (url.includes("/limited-partner/")) {
        const limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isLegalEntity()
          .withNotDisqualifiedStatementChecked(true)
          .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY)
          .build();

        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
      }

      const res = await request(app).post(url).send({
        pageType: PostTransitionPageType.updateLimitedPartnerLegalEntity,
        legal_entity_name: "MY LP",
        legal_form: "form",
        governing_law: "British",
        legal_entity_register_name: "Irish",
        legal_entity_registration_location: "England",
        registered_company_number: "12345678"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(1);
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.kind).toEqual(
        PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY
      );
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.legal_entity_name).toEqual("MY LP");
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.legal_form).toEqual("form");
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.governing_law).toEqual("British");
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.legal_entity_register_name).toEqual(
        "Irish"
      );
      expect(
        appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.legal_entity_registration_location
      ).toEqual("England");
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.registered_company_number).toEqual(
        "12345678"
      );
    });

    it("should replay entered data when a validation error occurs", async () => {
      const apiErrors: ApiErrors = {
        errors: { legal_entity_name: "legal entity name is invalid" }
      };
      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.updateLimitedPartnerLegalEntity,
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
});
