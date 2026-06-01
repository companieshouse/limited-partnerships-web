import UIErrors from "../entities/UIErrors";
import { containsInvalidCharacters, isFieldValueMissing, isFieldValueTooLong } from "./FieldValidators";
import { validateDateOfBirth, DateErrorMessages, getDateErrorMessages } from "./DateValidators";
import { CONSENT_CHECKED_FIELD, FORENAME_FIELD, MIDDLE_NAMES_FIELD, NATIONALITY2_FIELD, NATIONALITY1_FIELD, SURNAME_FIELD, TITLE_FIELD, TITLE_OTHER_FIELD } from "../../config";

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
  private dateErrorMessages: DateErrorMessages = {} as DateErrorMessages;

  set(data: PscFormData, i18n: any): this {
    this.title = data.title;
    this.title_other = data.title_other;
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
    this.titleOtherValue = i18n?.personWithSignificantControl?.addPersonWithSignificantControl?.addIndividualPerson?.titles?.other;
    this.dateErrorMessages = getDateErrorMessages(i18n);
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
    validateDateOfBirth(this.date_of_birth_day, this.date_of_birth_month, this.date_of_birth_year, uiErrors, this.dateErrorMessages);
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

  private validateTitleOther(uiErrors: UIErrors) {
    if (this.title === this.titleOtherValue && isFieldValueMissing(this.title_other, TITLE_OTHER_FIELD, uiErrors, this.errorMessages?.otherTitleMissing)) {
      return;
    }

    if (this.title !== this.titleOtherValue && this.title_other?.trim()) {
      uiErrors.setWebError(TITLE_OTHER_FIELD, this.errorMessages?.otherTitleShouldBeEmpty);
      return;
    }

    if (containsInvalidCharacters(this.title_other, TITLE_OTHER_FIELD, uiErrors, this.errorMessages?.otherTitleInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.title_other, 50, TITLE_OTHER_FIELD, uiErrors, this.errorMessages?.otherTitleTooLong)) {
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

};
