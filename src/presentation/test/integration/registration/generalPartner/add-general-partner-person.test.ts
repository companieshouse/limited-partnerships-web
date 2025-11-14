import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
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
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
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
      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(
        `${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${GENERAL_PARTNER_CHOICE_TEMPLATE}`
      );
      expect(res.text).toMatch(regex);
    });
  });

  describe("Post Add General Partner", () => {
    it.each([
      [ "true", "john" ],
      [ "false", "" ]
    ])("should send the general partner details", async (previousName, formerNames) => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "test",
        previousName: previousName,
        former_names: formerNames
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "general partner name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("general partner name is invalid");
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
        former_names: "",
        previousName: "false",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previousNameNo" name="previousName" type="radio" value="false" checked');
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
        previousName: "true",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
      expect(res.text).toContain("Enter the previous name(s) of the general partner");
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
        forename: "test"
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

      const apiErrors: ApiErrors = {
        errors: { forename: "general partner name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.addGeneralPartnerPerson,
        forename: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("general partner name is invalid");
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
        previousName: "true",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain('<option value="Mongolian" selected>Mongolian</option>');
      expect(res.text).toContain('<option value="Uzbek" selected>Uzbek</option>');
      expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
    });
  });
});
