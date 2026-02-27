import request from "supertest";
import { LimitedPartner, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, expectChangeLinks, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";

import { UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL, WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL } from "../../../../../controller/postTransition/url";
import CompanyAppointmentBuilder from "../../../../builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../../controller/global/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY } from "../../../../../../config";
import LimitedPartnerBuilder from "../../../../builder/LimitedPartnerBuilder";

describe("Update limited partner legal entity check your answers page", () => {
  const URL = getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL);
  let limitedPartner: LimitedPartner;
  let companyAppointment;
  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);

    limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isLegalEntity()
      .withPrincipalOfficeAddress({
        "address_line_1": "DUNCALF STREET",
        "address_line_2": "",
        "country": "England",
        "locality": "STOKE-ON-TRENT",
        "postal_code": "ST6 3LJ",
        "premises": "6",
        "region": ""
      })
      .withPrincipalOfficeAddressUpdateRequired(true)
      .withAppointmentId("AP123456")
      .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY)
      .withDateOfUpdate("2025-01-01")
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    companyAppointment = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY)
      .isLegalEntity()
      .build();
    appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET update limited partner check your answers page", () => {
    it("should load update limited partner check your answers page with english text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(companyProfile.data.companyName + " (" + companyProfile.data.companyNumber + ")");
      expect(res.text).toContain(`${enTranslationText.checkYourAnswersPage.update.title}`);
      testTranslations(res.text, enTranslationText.checkYourAnswersPage.partners, [
        "generalPartners",
        "limitedPartners",
        "limitedPartner",
        "person"
      ]);
      expect(res.text).toContain(limitedPartner.data?.legal_entity_name);
      expect(res.text).toContain(limitedPartner.data?.legal_form);
      expect(res.text).toContain(limitedPartner.data?.governing_law);
      expect(res.text).toContain(limitedPartner.data?.legal_entity_register_name);
      expect(res.text).toContain(limitedPartner.data?.legal_entity_registration_location);
      expect(res.text).toContain(limitedPartner.data?.registered_company_number);
      expect(res.text).toContain("6 Duncalf Street, Stoke-On-Trent, England, ST6 3LJ");
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.update.dateOfChange);
      expect(res.text).toContain("1 January 2025");
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expectChangeLinks(res.text, [WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL]);
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.update.notUpdated);
      expect(countOccurrences(res.text, toEscapedHtml(enTranslationText.serviceName.updateLimitedPartnerLegalEntity))).toBe(2);
    });

    it("should load update limited partner check your answers page with welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(`${cyTranslationText.checkYourAnswersPage.update.title}`);
      testTranslations(res.text, cyTranslationText.checkYourAnswersPage.partners.legalEntity);
      expect(res.text).toContain(limitedPartner.data?.legal_entity_name);
      expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.update.dateOfChange);

      expect(res.text).toContain(cyTranslationText.print.buttonText);
      expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("WELSH -");
      expect(res.text).not.toContain(cyTranslationText.checkYourAnswersPage.update.notUpdated);
      expect(countOccurrences(res.text, toEscapedHtml(cyTranslationText.serviceName.updateLimitedPartnerLegalEntity))).toBe(2);
    });

    it("should load update limited partner check your answers page and display 'Not updated' for non-updated fields", async () => {
      limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .withPrincipalOfficeAddressUpdateRequired(false)
        .withLegalEntityName(companyAppointment.name)
        .withLegalForm(companyAppointment.identification?.legalForm)
        .withGoverningLaw(companyAppointment.identification?.legalAuthority)
        .withLegalEntityRegisterName(companyAppointment.identification?.placeRegistered)
        .withLegalEntityRegistrationLocation(companyAppointment.identification?.registerLocation)
        .withRegistrationNumber(companyAppointment.identification?.registrationNumber)
        .withAppointmentId(companyAppointment.identification?.appointmentId)
        .withDateOfUpdate("2025-01-01")
        .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY)
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.update.notUpdated);
      expect(res.text).not.toContain("6 Duncalf Street, Stoke-On-Trent, England, ST6 3LJ");
      expect(res.text).not.toContain(limitedPartner.data?.legal_entity_name);
      expect(res.text).not.toContain(limitedPartner.data?.legal_form);
      expect(res.text).not.toContain(limitedPartner.data?.governing_law);
      expect(res.text).not.toContain(limitedPartner.data?.legal_entity_register_name);
      expect(res.text).not.toContain(limitedPartner.data?.legal_entity_registration_location);
      expect(res.text).not.toContain(limitedPartner.data?.registered_company_number);
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.update.dateOfChange);
    });
  });

  describe("POST update limited partner check your answers page", () => {
    it("should post update limited partner check your answers page and redirect to confirmation page", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.updateLimitedPartnerLegalEntityCheckYourAnswers
      });

      const REDIRECT_URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
