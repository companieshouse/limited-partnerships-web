import UIErrors from "../entities/UIErrors";
import { containsInvalidCharacters, isFieldValueMissing, isFieldValueTooLong } from "./FieldValidators";
import { dateContainsInvalidChars, DateErrorMessages, hasInvalidDateFieldLengths, hasMisingDateFields, isDateInFuture, isValidDate } from "./DateValidators";
import { CONSENT_CHECKED_FIELD, FORENAME_FIELD, MIDDLE_NAMES_FIELD, NATIONALITY2_FIELD, NATIONALITY1_FIELD, SURNAME_FIELD, DATE_OF_BIRTH_FIELD, TITLE_FIELD } from "../../config";

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
};

export default class IndividualPscValidator {
  private title?: string;
  private forename?: string;
  private middle_names?: string;
  private surname?: string;
  private date_of_birth_day?: string;
  private date_of_birth_month?: string;
  private date_of_birth_year?: string;
  private nationality1?: string;
  private nationality2?: string;
  private consent_checked?: boolean | string;
  private errorMessages: Record<string, string> = {};

  set(data: PscFormData, i18n: any): this {
    this.title = data.title;
    this.forename = data.forename;
    this.middle_names = data.middle_names;
    this.surname = data.surname;
    this.date_of_birth_day = data['date_of_birth-day'];
    this.date_of_birth_month = data['date_of_birth-month'];
    this.date_of_birth_year = data['date_of_birth-year'];
    this.nationality1 = data.nationality1;
    this.nationality2 = data.nationality2;
    this.consent_checked = data.consent_checked;

    this.errorMessages = i18n?.errorMessages?.personWithSignificantControl?.addIndividualPerson || {};
    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    this.validateConsentChecked(uiErrors);
    this.validateTitle(uiErrors);
    this.validateForename(uiErrors);
    this.validateMiddleNames(uiErrors);
    this.validateSurname(uiErrors);
    this.validateDateOfBirth(uiErrors);
    this.validateNationalities(uiErrors);
    return uiErrors;
  }

  private validateConsentChecked(uiErrors: UIErrors) {
    if (!this.consent_checked || this.consent_checked === "false") {
      uiErrors.setWebError(CONSENT_CHECKED_FIELD, this.errorMessages?.consentCheckedMissing);
    }
  }

  private validateTitle(uiErrors: UIErrors) {
    if (containsInvalidCharacters(this.title, TITLE_FIELD, uiErrors, this.errorMessages?.titleInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.title, 50, TITLE_FIELD, uiErrors, this.errorMessages?.titleTooLong)) {
      return;
    }
  }

  private validateForename(uiErrors: UIErrors) {
    if (isFieldValueMissing(this.forename, FORENAME_FIELD, uiErrors, this.errorMessages?.firstNameMissing)) {
      return;
    }

    if (containsInvalidCharacters(this.forename, FORENAME_FIELD, uiErrors, this.errorMessages?.firstNameInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.forename, 50, FORENAME_FIELD, uiErrors, this.errorMessages?.firstNameTooLong)) {
      return;
    }
  }

  private validateMiddleNames(uiErrors: UIErrors) {
    if (containsInvalidCharacters(this.middle_names, MIDDLE_NAMES_FIELD, uiErrors, this.errorMessages?.middleNamesInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.middle_names, 50, MIDDLE_NAMES_FIELD, uiErrors, this.errorMessages?.middleNamesTooLong)) {
      return;
    }
  }

  private validateSurname(uiErrors: UIErrors) {
    if (isFieldValueMissing(this.surname, SURNAME_FIELD, uiErrors, this.errorMessages?.lastNameMissing)) {
      return;
    }

    if (containsInvalidCharacters(this.surname, SURNAME_FIELD, uiErrors, this.errorMessages?.lastNameInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.surname, 160, SURNAME_FIELD, uiErrors, this.errorMessages?.lastNameTooLong)) {
      return;
    }
  }

  private validateNationalities(uiErrors: UIErrors) {
    if (isFieldValueMissing(this.nationality1, NATIONALITY1_FIELD, uiErrors, this.errorMessages?.nationality1Missing)) {
      return;
    }

    if (this.nationality1?.trim() && this.nationality2?.trim() && this.nationality2.trim() === this.nationality1?.trim()) {
      uiErrors.setWebError(NATIONALITY2_FIELD, this.errorMessages?.nationality2Same);
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

    const safeDobDay = this.date_of_birth_day ?? "";
    const safeDobMonth = this.date_of_birth_month ?? "";
    const safeDobYear = this.date_of_birth_year ?? "";
    const dateOfBirthField = DATE_OF_BIRTH_FIELD;

    if (hasMisingDateFields(safeDobDay, safeDobMonth, safeDobYear, dateOfBirthField, uiErrors, dateErrorMessages)) {
      return;
    };

    if (hasInvalidDateFieldLengths(safeDobDay, safeDobMonth, safeDobYear, dateOfBirthField, uiErrors, dateErrorMessages)) {
      return;
    }

    if (dateContainsInvalidChars(safeDobDay, safeDobMonth, safeDobYear)) {
      uiErrors.setWebError(dateOfBirthField, this.errorMessages?.dateOfBirthInvalidChars);
      return;
    }

    if (!isValidDate(safeDobDay, safeDobMonth, safeDobYear)) {
      uiErrors.setWebError(dateOfBirthField, this.errorMessages?.dateOfBirthInvalidDate);
      return;
    }

    if (isDateInFuture(safeDobDay, safeDobMonth, safeDobYear)) {
      uiErrors.setWebError(dateOfBirthField, this.errorMessages?.dateOfBirthInFuture);
    }
  }
};
