import request from "supertest";
import { GeneralPartner, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, toEscapedHtml } from "../../../../utils";

import { UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/postTransition/url";
import GeneralPartnerBuilder from "../../../../builder/GeneralPartnerBuilder";
import CompanyAppointmentBuilder from "../../../../builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../../controller/global/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { OFFICER_ROLE_GENERAL_PARTNER_PERSON } from "../../../../../../config";

describe("Update general partner check your answers page", () => {
  const URL = getUrl(UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL);
  let generalPartner: GeneralPartner;
  let companyAppointment;
  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);

    generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withNationality1("Irish")
      .withUsualResidentialAddress({
        "address_line_1": "DUNCALF STREET",
        "address_line_2": "",
        "country": "England",
        "locality": "STOKE-ON-TRENT",
        "postal_code": "ST6 3LJ",
        "premises": "6",
        "region": ""
      })
      .withUsualResidentialAddressUpdateRequired(true)
      .withServiceAddress()
      .withServiceAddressUpdateRequired(true)
      .withAppointmentId("AP123456")
      .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
      .withDateOfUpdate("2025-01-01")
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    companyAppointment = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_PERSON)
      .withName("Doe, John")
      .withNationality("British")
      .build();
    appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointment]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET update general partner check your answers page", () => {
    it("should load update general partner check your answers page with english text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(companyProfile.data.companyName + " (" + companyProfile.data.companyNumber + ")");
      expect(res.text).toContain(`${enTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(generalPartner.data?.forename);
      expect(res.text).toContain(generalPartner.data?.surname);
      expect(res.text).toContain(generalPartner.data?.nationality1);
      expect(res.text).toContain("6 Duncalf Street, Stoke-On-Trent, England, ST6 3LJ");
      expect(res.text).toContain("4 Service Address Line 1, Line 2, Stoke-On-Trent, Region, England, ST6 3LJ");
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.update.dateOfChange);
      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("1 January 2025");
      expect(res.text).not.toContain("WELSH -");
      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.update.notUpdated);
      expect(countOccurrences(res.text, toEscapedHtml(enTranslationText.serviceName.updateGeneralPartnerPerson))).toBe(2);
    });

    it("should load update general partner check your answers page with welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(`${cyTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(generalPartner.data?.forename + " " + generalPartner.data?.surname);
      expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.update.dateOfChange);

      expect(res.text).toContain(cyTranslationText.print.buttonText);
      expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("WELSH -");
      expect(res.text).not.toContain(cyTranslationText.checkYourAnswersPage.update.notUpdated);
      expect(countOccurrences(res.text, toEscapedHtml(cyTranslationText.serviceName.updateGeneralPartnerPerson))).toBe(2);
    });

    it("should load update general partner check your answers page and display 'Not updated' for non-updated fields", async () => {
      generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withNationality1("British")
        .withForename("John")
        .withSurname("Doe")
        .withUsualResidentialAddressUpdateRequired(false)
        .withServiceAddressUpdateRequired(false)
        .withServiceAddress()
        .withAppointmentId("AP123456")
        .withDateOfUpdate("2025-01-01")
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.update.notUpdated);
      expect(res.text).not.toContain(generalPartner.data?.forename);
      expect(res.text).not.toContain(generalPartner.data?.surname);
      expect(res.text).not.toContain(generalPartner.data?.nationality1);
      expect(res.text).not.toContain("4 Service Address Line 1, Line 2, Stoke-On-Trent, Region, England, ST6 3LJ");
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.update.dateOfChange);
    });
  });

  describe("POST update general partner check your answers page", () => {
    it("should post update general partner check your answers page and redirect to confirmation page", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.updateGeneralPartnerPersonCheckYourAnswers
      });

      const REDIRECT_URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
