import { PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import UIErrors from "../entities/UIErrors";
import {
  GOVERNING_LAW_FIELD,
  LEGAL_ENTITY_NAME_FIELD,
  LEGAL_FORM_FIELD,
  VALID_CHARACTERS_REGEX
} from "../../config/constants";
import { dateContainsInvalidChars, DateErrorMessages, isDateInFuture, isValidDate, validateDateFieldLengths, validateMisingDateFields } from "./Date";

type PscFormData = {
  consent_checked?: boolean | string;
  title?: string;
  forename?: string;
  middle_names?: string;
  surname?: string;
  'date_of_birth-day'?: string;
  'date_of_birth-month'?: string;
  'date_of_birth-year'?: string;
  nationality1?: string;
  nationality2?: string;
  type?: string;
  legal_entity_name?: string;
  legal_form?: string;
  governing_law?: string;
};

class PersonWithSignificantControlValidator {
  private type?: string;
  private legal_entity_name?: string;
  private legal_form?: string;
  private governing_law?: string;
  private consent_checked?: boolean | string;
  private title?: string;
  private forename?: string;
  private middle_names?: string;
  private surname?: string;
  private date_of_birth_day?: string;
  private date_of_birth_month?: string;
  private date_of_birth_year?: string;
  private nationality1?: string;
  private nationality2?: string;

  private errorMessages: Record<string, string> = {};

  set(data: PscFormData, i18n: any): this {
    console.log("Setting data for PSC validation:", data);
    this.type = data.type;
    this.legal_entity_name = data.legal_entity_name;
    this.legal_form = data.legal_form;
    this.governing_law = data.governing_law;
    this.consent_checked = data.consent_checked;
    this.title = data.title;
    this.forename = data.forename;
    this.middle_names = data.middle_names;
    this.surname = data.surname;
    this.date_of_birth_day = data['date_of_birth-day'];
    this.date_of_birth_month = data['date_of_birth-month'];
    this.date_of_birth_year = data['date_of_birth-year'];
    this.nationality1 = data.nationality1;
    this.nationality2 = data.nationality2;

    if (data.type === PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON) {
      this.errorMessages = i18n?.errorMessages?.personWithSignificantControl?.addOtherRegistrablePerson || {};
    }

    if (data.type === PersonWithSignificantControlType.INDIVIDUAL_PERSON) {
      this.errorMessages = i18n?.errorMessages?.personWithSignificantControl?.addIndividualPerson || {};
    }

    return this;
  }

  public runValidation(): UIErrors {
    const uiErrors = new UIErrors();

    if (this.type === PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON) {
      this.runOtherRegistrablePersonValidation(uiErrors);
    }

    if (this.type === PersonWithSignificantControlType.INDIVIDUAL_PERSON) {
      this.runIndividualPersonValidation(uiErrors);

    }

    return uiErrors;
  }

  private runOtherRegistrablePersonValidation(uiErrors: UIErrors) {
    this.validateLegalEntityName(uiErrors);
    this.validateLegalForm(uiErrors);
    this.validateGoverningLaw(uiErrors);
  }

  private runIndividualPersonValidation(uiErrors: UIErrors) {
    this.validateConsentChecked(uiErrors);
    this.validateTitle(uiErrors);
    this.validateForename(uiErrors);
    this.validateMiddleNames(uiErrors);
    this.validateSurname(uiErrors);
    this.validateDateOfBirth(uiErrors);
    this.validateNationalities(uiErrors);
  }

  private validateNationalities(uiErrors: UIErrors) {
    if (!this.nationality1?.trim()) {
      uiErrors.setWebError("nationality1", this.errorMessages?.nationality1Missing);
    }

    // check if nationality 2 is different from nationality 1 if nationality 2 is provided
    if (this.nationality1?.trim() && this.nationality2?.trim() && this.nationality2.trim() === this.nationality1?.trim()) {
      uiErrors.setWebError("nationality2", this.errorMessages?.nationality2Same);
    }
  }

  private validateDateOfBirth(uiErrors: UIErrors) {
    const dateErrorMessages: DateErrorMessages = {
      dateMissing: this.errorMessages?.dateOfBirthMissing,
      dayMissing: this.errorMessages?.dateOfBirthDayMissing,
      monthMissing: this.errorMessages?.dateOfBirthMonthMissing,
      yearMissing: this.errorMessages?.dateOfBirthYearMissing,
      dayAndMonthMissing: this.errorMessages?.dateOfBirthDayAndMonthMissing,
      dayAndYearMissing: this.errorMessages?.dateOfBirthDayAndYearMissing,
      monthAndYearMissing: this.errorMessages?.dateOfBirthMonthAndYearMissing,
      dayInvalidLength: this.errorMessages?.dateOfBirthDayInvalidLength,
      monthInvalidLength: this.errorMessages?.dateOfBirthMonthInvalidLength,
      yearInvalidLength: this.errorMessages?.dateOfBirthYearInvalidLength
    };

    const safeDobDay = this.date_of_birth_day || "";
    const safeDobMonth = this.date_of_birth_month || "";
    const safeDobYear = this.date_of_birth_year || "";
    const dateOfBirthField = "date_of_birth";

    validateMisingDateFields(safeDobDay, safeDobMonth, safeDobYear, dateOfBirthField, uiErrors, dateErrorMessages);
    validateDateFieldLengths(safeDobDay, safeDobMonth, safeDobYear, dateOfBirthField, uiErrors, dateErrorMessages);

    if (dateContainsInvalidChars(safeDobDay, safeDobMonth, safeDobYear)) {
      uiErrors.setWebError(dateOfBirthField, this.errorMessages?.dateOfBirthInvalidChars);
    }

    // check if date is a real date (e.g. not 31st of February)
    if (!isValidDate(safeDobDay, safeDobMonth, safeDobYear)) {
      uiErrors.setWebError(dateOfBirthField, this.errorMessages?.dateOfBirthInvalidDate);
    }

    // check if date of birth is in the future
    if (isDateInFuture(safeDobDay, safeDobMonth, safeDobYear)) {
      uiErrors.setWebError(dateOfBirthField, this.errorMessages?.dateOfBirthInFuture);
    }
  }

  private validateSurname(uiErrors: UIErrors) {
    const surnameField = "surname";
    if (!this.surname?.trim()) {
      uiErrors.setWebError(surnameField, this.errorMessages?.lastNameMissing);
    } else {
      if (!this.containsInvalidCharacters(this.surname, surnameField, uiErrors, this.errorMessages?.lastNameInvalid)) {
        if ((this.surname || "").length > 160) {
          uiErrors.setWebError(surnameField, this.errorMessages?.lastNameTooLong);
        }
      }
    }
  }

  private validateMiddleNames(uiErrors: UIErrors) {
    const middleNamesField = "middle_names";

    if (!this.containsInvalidCharacters(this.middle_names, middleNamesField, uiErrors, this.errorMessages?.middleNamesInvalid)) {
      if ((this.middle_names || "").length > 50) {
        uiErrors.setWebError(middleNamesField, this.errorMessages?.middleNamesTooLong);
      }
    }
  }

  private validateForename(uiErrors: UIErrors) {
    const forenameField = "forename";
    if (!this.forename?.trim()) {
      uiErrors.setWebError(forenameField, this.errorMessages?.firstNameMissing);
    }

    if (!this.containsInvalidCharacters(this.forename, forenameField, uiErrors, this.errorMessages?.firstNameInvalid)) {
      if ((this.forename || "").length > 50) {
        uiErrors.setWebError(forenameField, this.errorMessages?.firstNameTooLong);
      }
    }
  }

  private validateTitle(uiErrors: UIErrors) {
    const titleField = "title";
    if (!this.containsInvalidCharacters(this.title, titleField, uiErrors, this.errorMessages?.titleInvalid)) {
      if ((this.title || "").length > 50) {
        uiErrors.setWebError(titleField, this.errorMessages?.titleTooLong);
      }
    }
  }

  private validateConsentChecked(uiErrors: UIErrors) {
    if (!this.consent_checked || this.consent_checked === "false") {
      uiErrors.setWebError("consent_checked", this.errorMessages?.consentCheckedMissing);
    }
  }

  private validateLegalEntityName(uiErrors: UIErrors): void {
    if (!this.legal_entity_name?.trim()) {
      uiErrors.setWebError(LEGAL_ENTITY_NAME_FIELD, this.errorMessages?.legalEntityNameMissing);
    } else {
      this.containsInvalidCharacters(this.legal_entity_name, LEGAL_ENTITY_NAME_FIELD, uiErrors, this.errorMessages?.legalEntityNameInvalid);
    }
  }

  private validateLegalForm(uiErrors: UIErrors): void {
    if (!this.legal_form?.trim()) {
      uiErrors.setWebError(LEGAL_FORM_FIELD, this.errorMessages?.legalFormMissing);
    } else {
      this.containsInvalidCharacters(this.legal_form, LEGAL_FORM_FIELD, uiErrors, this.errorMessages?.legalFormInvalid);
    }
  }

  private validateGoverningLaw(uiErrors: UIErrors): void {
    if (!this.governing_law?.trim()) {
      uiErrors.setWebError(GOVERNING_LAW_FIELD, this.errorMessages?.governingLawMissing);
    }
  }

  private containsInvalidCharacters(fieldValue: string | undefined, fieldName: string, uiErrors: UIErrors, errorMessage: string): boolean {
    if (fieldValue && !VALID_CHARACTERS_REGEX.test(fieldValue)) {
      uiErrors.setWebError(fieldName, errorMessage);
      return true;
    }
    return false;
  }
}

export default PersonWithSignificantControlValidator;
