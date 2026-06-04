import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../locales/cy/errors.json";

import app from "../../app";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";
import RegistrationPageType from "../../../../controller/registration/PageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import {
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL
} from "../../../../controller/registration/url";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import { TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../controller/addressLookUp/url/registration";
import { REGISTRATION_BASE_URL } from "../../../../../config/constants";
import {
  GENERAL_PARTNER_CHOICE_TEMPLATE,
  REVIEW_GENERAL_PARTNERS_TEMPLATE
} from "../../../../controller/registration/template";

describe("Add General Partner Person Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();
  });

  describe("Get Add General Partner Page", () => {
    it("should load the add general partner page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.addPartnerPersonPage.generalPartner.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.addPartnerPersonPage, [
        "errorMessages",
        "limitedPartner",
        "dateEffectiveFrom"
      ]);
      testTranslations(res.text, cyTranslationText.generalPartnersPage, ["title", "pageInformation"]);
    });

    it("should load the add general partner page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.addPartnerPersonPage.generalPartner.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.addPartnerPersonPage, [
        "errorMessages",
        "limitedPartner",
        "dateEffectiveFrom"
      ]);
      testTranslations(res.text, enTranslationText.generalPartnersPage, ["title", "pageInformation"]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the add general partner page and replay previously saved data", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withNotDisqualifiedStatementChecked(true)
        .withFormerNames("FORMER-NAMES")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      setLocalesEnabled(true);
      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Joe - GP");
      expect(res.text).toContain("Doe - GP");
      expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain('<option value="British" selected>British</option>');
      expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
    });

    it("should contain the proposed name - data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
      );
    });

    it("should contain a back link to the review page when general partners are present", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${REVIEW_GENERAL_PARTNERS_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });

    it("should contain a back link to the choice page when general partners are not present", async () => {
      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_PERSON_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${GENERAL_PARTNER_CHOICE_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Add General Partner", () => {
    it("should send the general partner details", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "test",
        surname: "test",
        previous_name: "true",
        former_names: "bob",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it.each([
      ["en", enErrorMessages],
      ["cy", cyErrorMessages]
    ])("should return validation errors when all data is missing - %s", async (lang: string, errorMessages: any) => {
      setLocalesEnabled(true);

      const res = await request(app).post(URL + "?lang=" + lang).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessages.errorMessages.partners.addPartner.firstNameMissing);
      expect(res.text).toContain(errorMessages.errorMessages.partners.addPartner.lastNameMissing);
      expect(res.text).toContain(errorMessages.errorMessages.partners.addPartner.previousNameNotSelected);
      expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.nationality1Missing));
      expect(res.text).toContain(errorMessages.errorMessages.partners.addPartner.disqualificationStatementMissingGeneralPartner);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrorMessages],
      ["cy", cyErrorMessages]
    ])("should return validation errors when former names is missing - %s", async (lang: string, errorMessages: any) => {
      setLocalesEnabled(true);

      const res = await request(app).post(URL + "?lang=" + lang).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        previous_name: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.formerNamesMissing));

      setLocalesEnabled(false);
    });

    it.each([
      ["en", "§", enErrorMessages.errorMessages.partners.addPartner.firstNameInvalid],
      ["en", "a".repeat(51), enErrorMessages.errorMessages.partners.addPartner.firstNameTooLong],
      ["cy", "§", cyErrorMessages.errorMessages.partners.addPartner.firstNameInvalid],
      ["cy", "a".repeat(51), cyErrorMessages.errorMessages.partners.addPartner.firstNameTooLong]
    ])("should return validation errors for forename errors - %s", async (lang: string, forename: string, errorMessage: string) => {
      setLocalesEnabled(true);

      const res = await request(app).post(URL + "?lang=" + lang).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: forename
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessage);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", "§", enErrorMessages.errorMessages.partners.addPartner.lastNameInvalid],
      ["en", "a".repeat(161), enErrorMessages.errorMessages.partners.addPartner.lastNameTooLong],
      ["cy", "§", cyErrorMessages.errorMessages.partners.addPartner.lastNameInvalid],
      ["cy", "a".repeat(161), cyErrorMessages.errorMessages.partners.addPartner.lastNameTooLong]
    ])("should return validation errors for surname errors - %s", async (lang: string, surname: string, errorMessage: string) => {
      setLocalesEnabled(true);

      const res = await request(app).post(URL + "?lang=" + lang).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        surname: surname
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessage);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", "§", enErrorMessages.errorMessages.partners.addPartner.formerNamesInvalid],
      ["en", "a".repeat(161), enErrorMessages.errorMessages.partners.addPartner.formerNamesTooLong],
      ["cy", "§", cyErrorMessages.errorMessages.partners.addPartner.formerNamesInvalid],
      ["cy", "a".repeat(161), cyErrorMessages.errorMessages.partners.addPartner.formerNamesTooLong]
    ])("should return validation errors for former names errors - %s", async (lang: string, formerNames: string, errorMessage: string) => {
      setLocalesEnabled(true);

      const res = await request(app).post(URL + "?lang=" + lang).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        former_names: formerNames
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessage);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrorMessages],
      ["cy", cyErrorMessages]
    ])("should return a validation error when nationality 1 and 2 are the same - %s", async (lang: string, errorMessages: any) => {
      setLocalesEnabled(true);

      const res = await request(app).post(URL + "?lang=" + lang).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        nationality1: "English",
        nationality2: "English"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.nationality2Same));

      setLocalesEnabled(false);
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "general partner name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "§§",
        surname: "SURNAME",
        former_names: "",
        previous_name: "false",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("§§");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previous_name-2" name="previous_name" type="radio" value="false" checked');
      expect(res.text).toContain('<option value="Mongolian" selected>Mongolian</option>');
      expect(res.text).toContain('<option value="Uzbek" selected>Uzbek</option>');
      expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
    });

    it.each([
      "",
      "   ",
      undefined
    ])("should show error message if previous names is Yes but no previous name entered", async (formerNames: string | undefined) => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "forename",
        surname: "SURNAME",
        former_names: formerNames,
        previous_name: "true",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
      expect(res.text).toContain(toEscapedHtml(enErrorMessages.errorMessages.partners.addPartner.formerNamesMissing));
    });
  });

  describe("Patch from Add General Partner", () => {
    it("should send the general partner details", async () => {
      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "test",
        surname: "test",
        previous_name: "true",
        former_names: "bob",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(302);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      // const apiErrors: ApiErrors = {
      //   errors: { forename: "general partner name is invalid" }
      // };

      // appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "§§"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrorMessages.errorMessages.partners.addPartner.firstNameInvalid);
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "general partner name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "INVALID-CHARACTERS-FORENAME",
        surname: "SURNAME",
        former_names: "FORMER-NAMES",
        previous_name: "true",
        "date_of_birth-day": "01",
        "date_of_birth-month": "11",
        "date_of_birth-year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain('<option value="Mongolian" selected>Mongolian</option>');
      expect(res.text).toContain('<option value="Uzbek" selected>Uzbek</option>');
      expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
    });
  });
});
