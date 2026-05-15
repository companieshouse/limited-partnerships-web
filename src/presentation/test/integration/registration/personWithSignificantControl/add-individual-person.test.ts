import request from "supertest";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlTranslationText from "../../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlTranslationText from "../../../../../../locales/cy/personWithSignificantControl.json";
import enErrors from "../../../../../../locales/en/errors.json";
import cyErrors from "../../../../../../locales/cy/errors.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControlBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import TransactionPersonWithSignificantControl from "../../../../../domain/entities/TransactionPersonWithSignificantControl";
import { PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Add Person With Significant Control Individual Person Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enPersonWithSignificantControlTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyPersonWithSignificantControlTranslationText };
  const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL);
  const REDIRECT_URL = getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const transaction = new TransactionBuilder().build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
    appDevDependencies.personWithSignificantControlGateway.feedErrors(null);
  });

  describe("Get Add Individual Person Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the add individual person page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.addPersonWithSignificantControl.addIndividualPerson.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.personWithSignificantControl.addPersonWithSignificantControl, [
          "addOtherRegistrablePerson",
          "addRelevantLegalEntity",
          "commonEntityFields"
        ]);
      }
    );

    it("should contain a back link to the choice page", async () => {
      const res = await request(app).get(
        getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL)
      );

      const BACK_LINK = getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(BACK_LINK);
    });

    it("should load data from api", async () => {
      const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL);

      const personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isIndividualPerson()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(`name="title" type="text" value="${personWithSignificantControl?.data?.title}"`);
      expect(res.text).toContain(`name="forename" type="text" value="${personWithSignificantControl?.data?.forename}"`);
      expect(res.text).toContain(`name="middle_names" type="text" value="${personWithSignificantControl?.data?.middle_names}"`);
      expect(res.text).toContain(`name="surname" type="text" value="${personWithSignificantControl?.data?.surname}"`);

      const dob = personWithSignificantControl?.data?.date_of_birth || "";
      const [year, month, day] = dob.split("-");

      expect(res.text).toContain(`name="date_of_birth-day" type="text" value="${day}"`);
      expect(res.text).toContain(`name="date_of_birth-month" type="text" value="${month}"`);
      expect(res.text).toContain(`name="date_of_birth-year" type="text" value="${year}"`);

      expect(res.text).toContain(`<option value="${personWithSignificantControl?.data?.nationality1}" selected>${personWithSignificantControl?.data?.nationality1}</option>`);
      expect(res.text).toContain(`<option value="${personWithSignificantControl?.data?.nationality2}" selected>${personWithSignificantControl?.data?.nationality2}</option>`);
    });
  });

  describe("Post Add Individual Person Page", () => {
    it("should send the individual person details", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(0);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(1);
      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl[0].data.type).toEqual(
        PersonWithSignificantControlType.INDIVIDUAL_PERSON
      );
    });

    it("should return a validation error when invalid data is entered", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      const apiErrors: ApiErrors = {
        errors: {
          consent_checked: "Consent is required",
          title: "Title is invalid",
          forename: "Forename is invalid",
          middle_names: "Middle names are invalid",
          surname: "Surname is invalid",
          date_of_birth: "Date of birth is invalid",
          nationality1: "Primary nationality is required",
          nationality2: "Secondary nationality must be different"
        }
      };

      appDevDependencies.personWithSignificantControlGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data,
          forename: "INVALID-CHARACTERS"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Consent is required");
      expect(res.text).toContain("Title is invalid");
      expect(res.text).toContain("Forename is invalid");
      expect(res.text).toContain("Middle names are invalid");
      expect(res.text).toContain("Surname is invalid");
      expect(res.text).toContain("Date of birth is invalid");
      expect(res.text).toContain("Primary nationality is required");
      expect(res.text).toContain("Secondary nationality must be different");
    });
  });

  describe("Patch Add Individual Person Page", () => {
    const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL);
    let personWithSignificantControl: TransactionPersonWithSignificantControl;

    beforeEach(() => {
      personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isIndividualPerson()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);
    });

    it("should update the individual person details", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data,
          forename: "forename updated"
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(
        appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl[0].data.forename
      ).toEqual("forename updated");
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "Forename is invalid" }
      };

      appDevDependencies.personWithSignificantControlGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data,
          forename: "INVALID-CHARACTERS"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Forename is invalid");
    });
  });

  describe("Date of birth validations", () => {
    const cases: Array<[string, string, string, string, string, string]> = [
      ["missing all", "", "", "", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthMissing],
      ["day missing", "", "3", "1976", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthDayMissing],
      ["month missing", "1", "", "1976", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthMonthMissing],
      ["year missing", "1", "3", "", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthYearMissing],
      ["day & month missing", "", "", "1976", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthDayAndMonthMissing],
      ["month & year missing", "1", "", "", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthMonthAndYearMissing],
      ["day & year missing", "", "3", "", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthDayAndYearMissing],
      ["invalid chars", "aa", "bb", "1976", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthInvalidChars],
      ["invalid date (29 Feb non leap year)", "29", "2", "2019", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthInvalidDate],
      ["in future", "1", "1", "2099", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthNotInPast],
      ["day too long", "123", "1", "1976", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthDayInvalidLength],
      ["month too long", "1", "123", "1976", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthMonthInvalidLength],
      ["year wrong length", "1", "1", "76", "en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthYearInvalidLength],

      ["missing all", "", "", "", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthMissing],
      ["day missing", "", "3", "1976", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthDayMissing],
      ["month missing", "1", "", "1976", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthMonthMissing],
      ["year missing", "1", "3", "", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthYearMissing],
      ["day & month missing", "", "", "1976", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthDayAndMonthMissing],
      ["month & year missing", "1", "", "", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthMonthAndYearMissing],
      ["day & year missing", "", "3", "", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthDayAndYearMissing],
      ["invalid chars", "aa", "bb", "1976", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthInvalidChars],
      ["invalid date (29 Feb non leap year)", "29", "2", "2019", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthInvalidDate],
      ["in future", "1", "1", "2099", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthNotInPast],
      ["day too long", "123", "1", "1976", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthDayInvalidLength],
      ["month too long", "1", "123", "1976", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthMonthInvalidLength],
      ["year wrong length", "1", "1", "76", "cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthYearInvalidLength]
    ];

    it.each(cases)(
      "shows %s validation",
      async (_desc: string, day: string, month: string, year: string, lang: string, expectedMsg: string) => {
        const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();
        setLocalesEnabled(true);

        const res = await request(app)
          .post(`${URL}?lang=${lang}`)
          .send({
            pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
            type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
            ...person.data,
            "date_of_birth-day": day,
            "date_of_birth-month": month,
            "date_of_birth-year": year
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(expectedMsg);

        setLocalesEnabled(false);
      }
    );

    it("should accept leap day 29 Feb 2024", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(0);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data,
          "date_of_birth-day": "29",
          "date_of_birth-month": "2",
          "date_of_birth-year": "2024"
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(1);
    });

    it("should not accept today's date", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(0);

      const today = new Date();
      const day = String(today.getDate());
      const month = String(today.getMonth() + 1);
      const year = String(today.getFullYear());

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...personWithSignificantControl.data,
          "date_of_birth-day": day,
          "date_of_birth-month": month,
          "date_of_birth-year": year
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.dateOfBirthNotInPast);

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(0);
    });
  });

  describe("Individual person field validations", () => {
    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.consentCheckedMissing],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.consentCheckedMissing]
    ])("shows consent checked missing validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          consent_checked: "false"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.titleInvalid],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.titleInvalid]
    ])("shows title invalid validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          title: "±"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.titleTooLong],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.titleTooLong]
    ])("shows title too long validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();
      const longTitle = "A".repeat(51);

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          title: longTitle
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.firstNameMissing],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.firstNameMissing]
    ])("shows first name missing validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          forename: ""
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.firstNameInvalid],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.firstNameInvalid]
    ])("shows first name invalid validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          forename: "±"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.firstNameTooLong],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.firstNameTooLong]
    ])("shows first name too long validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();
      const longName = "A".repeat(51);

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          forename: longName
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.middleNamesInvalid],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.middleNamesInvalid]
    ])("shows middle names invalid validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          middle_names: "±"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.middleNamesTooLong],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.middleNamesTooLong]
    ])("shows middle names too long validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();
      const longNames = "A".repeat(51);

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          middle_names: longNames
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.lastNameMissing],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.lastNameMissing]
    ])("shows last name missing validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          surname: ""
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.lastNameInvalid],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.lastNameInvalid]
    ])("shows last name invalid validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          surname: "±"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.lastNameTooLong],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.lastNameTooLong]
    ])("shows last name too long validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();
      const longSurname = "A".repeat(161);

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          surname: longSurname
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.nationality1Missing],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.nationality1Missing]
    ])("shows nationality1 missing validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          nationality1: ""
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);

      setLocalesEnabled(false);
    });

    it.each([
      ["en", enErrors.errorMessages.personWithSignificantControl.addIndividualPerson.nationality2Same],
      ["cy", cyErrors.errorMessages.personWithSignificantControl.addIndividualPerson.nationality2Same]
    ])("shows nationality2 same validation for %s", async (lang, expectedMsg) => {
      const person = new PersonWithSignificantControlBuilder().isIndividualPerson().build();

      setLocalesEnabled(true);
      const url = `${URL}?lang=${lang}`;

      const res = await request(app)
        .post(url)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
          type: PersonWithSignificantControlType.INDIVIDUAL_PERSON,
          ...person.data,
          nationality1: "British",
          nationality2: "British"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedMsg);
      setLocalesEnabled(false);
    });
  });
});
