import UIErrors from "../entities/UIErrors";
import { containsInvalidCharacters, isFieldValueMissing, isFieldValueTooLong } from "./FieldValidators";
import { validateDate } from "./DateValidators";
import {
  CONSENT_CHECKED_FIELD,
  FORENAME_FIELD,
  MIDDLE_NAMES_FIELD,
  NATIONALITY2_FIELD,
  NATIONALITY1_FIELD,
  SURNAME_FIELD,
  TITLE_FIELD,
  TITLE_OTHER_FIELD,
  DATE_OF_BIRTH_FIELD
} from "../../config";

type PscFormData = {
  consent_checked?: boolean | string;
  title?: string;
  title_other?: string;
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
  private title_other?: string;
  private forename?: string;
  private middle_names?: string;
  private surname?: string;
  private date_of_birth_day?: string;
  private date_of_birth_month?: string;
  private date_of_birth_year?: string;
  private nationality1?: string;
  private nationality2?: string;
  private consent_checked?: boolean | string;
  private titleOtherValue?: string;

  private errorMessages: Record<string, string> = {};
  private dateOfBirthErrorMessages: Record<string, string> = {};

  set(data: PscFormData, i18n: any): this {
    this.title = data.title;
    this.title_other = data.title_other;
    this.forename = data.forename;
    this.middle_names = data.middle_names;
    this.surname = data.surname;
    this.date_of_birth_day = data[`${DATE_OF_BIRTH_FIELD}-day`];
    this.date_of_birth_month = data[`${DATE_OF_BIRTH_FIELD}-month`];
    this.date_of_birth_year = data[`${DATE_OF_BIRTH_FIELD}-year`];
    this.nationality1 = data.nationality1;
    this.nationality2 = data.nationality2;
    this.consent_checked = data.consent_checked;

    this.errorMessages = i18n?.errorMessages?.personWithSignificantControl?.addIndividualPerson || {};
    this.titleOtherValue =
      i18n?.personWithSignificantControl?.addPersonWithSignificantControl?.addIndividualPerson?.titles?.other;
    this.dateOfBirthErrorMessages = i18n?.errorMessages?.dateOfBirth || {};
    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    this.validateConsentChecked(uiErrors);
    this.validateTitle(uiErrors);
    this.validateTitleOther(uiErrors);
    this.validateForename(uiErrors);
    this.validateMiddleNames(uiErrors);
    this.validateSurname(uiErrors);
    validateDate(
      {
        day: this.date_of_birth_day,
        month: this.date_of_birth_month,
        year: this.date_of_birth_year
      },
      uiErrors,
      DATE_OF_BIRTH_FIELD,
      this.dateOfBirthErrorMessages
    );
    this.validateNationalities(uiErrors);
    return uiErrors;
  }

  private validateConsentChecked(uiErrors: UIErrors) {
    if (!this.consent_checked || this.consent_checked === "false") {
      uiErrors.setWebError(CONSENT_CHECKED_FIELD, this.errorMessages?.consentCheckedMissing);
    }
  }

  private validateTitle(uiErrors: UIErrors) {
    if (containsInvalidCharacters(uiErrors, this.errorMessages?.titleInvalid, TITLE_FIELD, this.title)) {
      return;
    }

    if (isFieldValueTooLong(50, uiErrors, this.errorMessages?.titleTooLong, TITLE_FIELD, this.title)) {
      return;
    }
  }

  private validateTitleOther(uiErrors: UIErrors) {
    if (
      this.title === this.titleOtherValue &&
      isFieldValueMissing(uiErrors, this.errorMessages?.otherTitleMissing, TITLE_OTHER_FIELD, this.title_other)
    ) {
      return;
    }

    if (this.title !== this.titleOtherValue && this.title_other?.trim()) {
      uiErrors.setWebError(TITLE_OTHER_FIELD, this.errorMessages?.otherTitleShouldBeEmpty);
      return;
    }

    if (containsInvalidCharacters(uiErrors, this.errorMessages?.otherTitleInvalid, TITLE_OTHER_FIELD, this.title_other)) {
      return;
    }

    if (isFieldValueTooLong(50, uiErrors, this.errorMessages?.otherTitleTooLong, TITLE_OTHER_FIELD, this.title_other)) {
      return;
    }
  }

  private validateForename(uiErrors: UIErrors) {
    if (isFieldValueMissing(uiErrors, this.errorMessages?.firstNameMissing, FORENAME_FIELD, this.forename)) {
      return;
    }

    if (containsInvalidCharacters(uiErrors, this.errorMessages?.firstNameInvalid, FORENAME_FIELD, this.forename)) {
      return;
    }

    if (isFieldValueTooLong(50, uiErrors, this.errorMessages?.firstNameTooLong, FORENAME_FIELD, this.forename)) {
      return;
    }
  }

  private validateMiddleNames(uiErrors: UIErrors) {
    if (containsInvalidCharacters(uiErrors, this.errorMessages?.middleNamesInvalid, MIDDLE_NAMES_FIELD, this.middle_names)) {
      return;
    }

    if (isFieldValueTooLong(50, uiErrors, this.errorMessages?.middleNamesTooLong, MIDDLE_NAMES_FIELD, this.middle_names)) {
      return;
    }
  }

  private validateSurname(uiErrors: UIErrors) {
    if (isFieldValueMissing(uiErrors, this.errorMessages?.lastNameMissing, SURNAME_FIELD, this.surname)) {
      return;
    }

    if (containsInvalidCharacters(uiErrors, this.errorMessages?.lastNameInvalid, SURNAME_FIELD, this.surname)) {
      return;
    }

    if (isFieldValueTooLong(160, uiErrors, this.errorMessages?.lastNameTooLong, SURNAME_FIELD, this.surname)) {
      return;
    }
  }

  private validateNationalities(uiErrors: UIErrors) {
    if (isFieldValueMissing(uiErrors, this.errorMessages?.nationality1Missing, NATIONALITY1_FIELD, this.nationality1)) {
      return;
    }

    if (this.nationality1?.trim() && this.nationality2?.trim() && this.nationality2.trim() === this.nationality1?.trim()) {
      uiErrors.setWebError(NATIONALITY2_FIELD, this.errorMessages?.nationality2Same);
    }
  }
};
