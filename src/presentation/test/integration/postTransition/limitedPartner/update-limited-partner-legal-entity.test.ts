import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { OFFICER_ROLE_LIMITED_PARTNER_LEGAL_ENTITY } from "../../../../../config";

import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";

import {
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL
} from "../../../../controller/postTransition/url";

describe("Update Limited Partner Legal Entity Page", () => {
  const URL = getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_URL);
  const URL_WITH_IDS = getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL);

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
});
