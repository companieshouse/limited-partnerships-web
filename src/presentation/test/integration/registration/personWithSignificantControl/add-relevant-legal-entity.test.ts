import request from "supertest";
import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";
import PersonWithSignificantControlBuilder from "../../../builder/PersonWithSignificantControlBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import TransactionPersonWithSignificantControl from "../../../../../domain/entities/TransactionPersonWithSignificantControl";
import { PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

describe("Add Person With Significant Control Relevant Legal Entity Page", () => {
  const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL);
  const URL_WITH_IDS = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL);
  const REDIRECT_URL = getUrl(WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const transaction = new TransactionBuilder().build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
    appDevDependencies.personWithSignificantControlGateway.feedErrors(null);
  });

  describe("Get Add Relevant Legal Entity Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the add relevant legal entity page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${translationText.personWithSignificantControl.addPersonWithSignificantControl.addRelevantLegalEntity.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.personWithSignificantControl.addPersonWithSignificantControl, [
          "addOtherRegistrablePerson",
          "addIndividualPerson",
        ]);
      }
    );

    it("should contain a back link to the choice page", async () => {
      const res = await request(app).get(
        getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL)
      );

      const BACK_LINK = getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL);

      expect(res.status).toBe(200);

      expect(res.text).toContain(BACK_LINK);
    });

    it("should load data from api", async () => {
      const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL);

      const personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isRelevantLegalEntity()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(personWithSignificantControl?.data?.legal_entity_name ?? ""));
    });

    it.each([
      ["show", "Yes", true, "govuk-radios__conditional"],
      ["hide", "No", false, "govuk-radios__conditional govuk-radios__conditional--hidden"]
    ])("should %s the register fields when entered on a register is %s", async (_visibility, _answer, enteredOnRegister, classes) => {
      const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL);
      const personWithSignificantControlBuilder = new PersonWithSignificantControlBuilder()
        .isRelevantLegalEntity()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .withEnteredOnRegister(enteredOnRegister);

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControlBuilder.build()
      ]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(`value="${enteredOnRegister}" checked`);
      expect(res.text).toContain(`class="${classes}" id="conditional-entered_on_register"`);
      expect(res.text).toContain('id="legal_entity_registration_location"');
      expect(res.text).toContain('id="legal_entity_register_name"');
      expect(res.text).toContain('id="registered_company_number"');
    });
  });

  describe("Post Add Relevant Legal Entity Page", () => {
    it("should send the relevant legal entity details", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isRelevantLegalEntity().build();

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(0);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          type: PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
          ...personWithSignificantControl.data
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl).toHaveLength(1);
      expect(appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl[0].data.type).toEqual(
        PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY
      );
    });

    it("should return a validation error when invalid data is entered", async () => {
      const personWithSignificantControl = new PersonWithSignificantControlBuilder().isRelevantLegalEntity().build();

      const apiErrors: ApiErrors = {
        errors: { legal_entity_name: "Legal entity name is invalid" }
      };

      appDevDependencies.personWithSignificantControlGateway.feedErrors(apiErrors);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          type: PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
          ...personWithSignificantControl.data,
          legal_entity_name: "INVALID-CHARACTERS"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Legal entity name is invalid");
    });
  });

  describe("Patch Add Relevant Legal Entity Page", () => {
    const URL = getUrl(ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL);
    let personWithSignificantControl: TransactionPersonWithSignificantControl;

    beforeEach(() => {
      personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isRelevantLegalEntity()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);
    });

    it("should update the relevant legal entity details", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          type: PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
          ...personWithSignificantControl.data,
          legal_entity_name: "legal entity name updated"
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(
        appDevDependencies.personWithSignificantControlGateway.personsWithSignificantControl[0].data.legal_entity_name
      ).toEqual("legal entity name updated");
    });
  });

  describe.each([
    ["en", URL, enTranslationText],
    ["en", URL_WITH_IDS, enTranslationText],
    ["cy", URL, cyTranslationText],
    ["cy", URL_WITH_IDS, cyTranslationText]
  ])("Validation Errors", (lang: string, url: string, translationText: any) => {
    let personWithSignificantControl: TransactionPersonWithSignificantControl;
    const urlDescription = url === URL_WITH_IDS ? "with ids" : "without ids";

    beforeEach(() => {
      setLocalesEnabled(true);

      personWithSignificantControl = new PersonWithSignificantControlBuilder()
        .isRelevantLegalEntity()
        .withId(appDevDependencies.personWithSignificantControlGateway.personWithSignificantControlId)
        .build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        personWithSignificantControl
      ]);
    });

    it.each([
      ["legal_entity_name", "addRelevantLegalEntity", "legalEntityNameMissing"],
      ["legal_form", "sharedLegalDetails", "legalFormMissing"],
      ["governing_law", "sharedLegalDetails", "governingLawMissing"],
      ["entered_on_register", "addRelevantLegalEntity", "enteredOnRegisterMissing"],
      ["legal_entity_registration_location", "addRelevantLegalEntity", "legalEntityRegistrationLocationMissing"],
      ["legal_entity_register_name", "addRelevantLegalEntity", "legalEntityRegisterNameMissing"],
      ["registered_company_number", "addRelevantLegalEntity", "registeredCompanyNumberMissing"]
    ])(`should return a validation error when invalid data is entered for %s (${lang}, ${urlDescription})`, async (fieldNameToBlank: string, errorGroupKey: string, errorMessageKey: string) => {
      const res = await request(app)
        .post(`${url}?lang=${lang}`)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          type: PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
          ...personWithSignificantControl.data,
          [fieldNameToBlank]: ""
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(translationText.errorMessages.personWithSignificantControl[errorGroupKey][errorMessageKey]));
    });

    it.each([
      ["legal_entity_name", "addRelevantLegalEntity", "legalEntityNameInvalid"],
      ["legal_form", "sharedLegalDetails", "legalFormInvalid"],
      ["governing_law", "sharedLegalDetails", "governingLawInvalid"],
      ["legal_entity_register_name", "addRelevantLegalEntity", "legalEntityRegisterNameInvalid"],
      ["registered_company_number", "addRelevantLegalEntity", "registeredCompanyNumberInvalid"]
    ])(`should return a validation error when invalid character is entered for %s (${lang}, ${urlDescription})`, async (fieldNameToChange: string, errorGroupKey: string, errorMessageKey: string) => {
      const res = await request(app)
        .post(`${url}?lang=${lang}`)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          type: PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
          ...personWithSignificantControl.data,
          [fieldNameToChange]: "±±±±±"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(translationText.errorMessages.personWithSignificantControl[errorGroupKey][errorMessageKey]));
    });

    it.each([
      ["legal_entity_name", "addRelevantLegalEntity", "legalEntityNameTooLong"],
      ["legal_form", "sharedLegalDetails", "legalFormTooLong"],
      ["governing_law", "sharedLegalDetails", "governingLawTooLong"],
      ["legal_entity_register_name", "addRelevantLegalEntity", "legalEntityRegisterNameTooLong"],
      ["registered_company_number", "addRelevantLegalEntity", "registeredCompanyNumberTooLong"]
    ])(`should return a validation error when value is too long for %s (${lang}, ${urlDescription})`, async (fieldNameToChange: string, errorGroupKey: string, errorMessageKey: string) => {
      const res = await request(app)
        .post(`${url}?lang=${lang}`)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          type: PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
          ...personWithSignificantControl.data,
          [fieldNameToChange]: "a".repeat(161)
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(translationText.errorMessages.personWithSignificantControl[errorGroupKey][errorMessageKey]));
    });

    it(`should not validate register details if entered_on_register is false (${lang}, ${urlDescription})`, async () => {
      const res = await request(app)
        .post(`${url}?lang=${lang}`)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          type: PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
          ...personWithSignificantControl.data,
          entered_on_register: "false",
          legal_entity_registration_location: "",
          legal_entity_register_name: "",
          registered_company_number: ""
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it(`should validate register details if entered_on_register is true (${lang}, ${urlDescription})`, async () => {
      const res = await request(app)
        .post(`${url}?lang=${lang}`)
        .send({
          pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
          type: PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
          ...personWithSignificantControl.data,
          entered_on_register: "true",
          legal_entity_registration_location: "",
          legal_entity_register_name: "",
          registered_company_number: ""
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(translationText.errorMessages.personWithSignificantControl.addRelevantLegalEntity.legalEntityRegistrationLocationMissing));
      expect(res.text).toContain(toEscapedHtml(translationText.errorMessages.personWithSignificantControl.addRelevantLegalEntity.legalEntityRegisterNameMissing));
      expect(res.text).toContain(toEscapedHtml(translationText.errorMessages.personWithSignificantControl.addRelevantLegalEntity.registeredCompanyNumberMissing));
    });
  });
});
