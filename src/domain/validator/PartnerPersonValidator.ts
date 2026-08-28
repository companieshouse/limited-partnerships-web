import { capitalContributionValidation, isCapitalContributionApplicable } from "./capitalContributionValidator";
import {
  CEASE_DATE_FIELD,
  DATE_EFFECTIVE_FROM_FIELD,
  DATE_OF_BIRTH_FIELD,
  DATE_OF_UPDATE_FIELD,
  FORENAME_FIELD,
  FORMER_NAMES_FIELD,
  NATIONALITY1_FIELD,
  NATIONALITY2_FIELD,
  NOT_DISQUALIFIED_STATEMENT_CHECKED_FIELD,
  PREVIOUS_NAME_FIELD,
  SURNAME_FIELD
} from "../../config";
import UIErrors from "../entities/UIErrors";
import { PartnerType } from "../types";
import { validateDate } from "./DateValidators";
import { buildDateOfUpdateErrorMessages } from "./dateOfUpdateErrorMessages";
import { containsInvalidCharacters, isFieldValueMissing, isFieldValueTooLong } from "./FieldValidators";
import {
  isAddPartnerPage,
  isCeaseDatePage,
  isWhenDidChangeUpdatePage
} from "../../presentation/controller/postTransition/pageType";

class PartnerPersonValidator {
  private data: Record<string, any> = {};

  private currencies: Record<string, any> = {};
  private errorMessages: Record<string, any> = {};

  private dateOfBirthErrorMessages: Record<string, string> = {};
  private dateEffectiveFromErrorMessages: Record<string, string> = {};
  private ceaseDateErrorMessages: Record<string, string> = {};
  private dateOfUpdateErrorMessages: Record<string, string> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;

    this.currencies = i18n?.currencies || {};
    this.errorMessages = {
      ...i18n?.errorMessages?.partners?.addPartner,
      capitalContribution: {
        ...i18n?.errorMessages?.capitalContribution
      }
    };

    this.dateOfBirthErrorMessages = {
      ...(i18n?.errorMessages?.dateOfBirth ?? {}),
      missing: this.errorMessages?.dateOfBirthMissing
    };

    this.dateEffectiveFromErrorMessages = i18n?.errorMessages?.dateEffectiveFrom ?? {};
    this.ceaseDateErrorMessages = i18n?.errorMessages?.ceaseDate ?? {};
    this.dateOfUpdateErrorMessages = buildDateOfUpdateErrorMessages(data.pageType, i18n);

    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    if (isCeaseDatePage(this.data.pageType)) {
      validateDate(
        {
          day: this.data[`${CEASE_DATE_FIELD}-day`],
          month: this.data[`${CEASE_DATE_FIELD}-month`],
          year: this.data[`${CEASE_DATE_FIELD}-year`]
        },
        uiErrors,
        CEASE_DATE_FIELD,
        this.ceaseDateErrorMessages
      );
      return uiErrors;
    }

    if (isWhenDidChangeUpdatePage(this.data.pageType)) {
      validateDate(
        {
          day: this.data[`${DATE_OF_UPDATE_FIELD}-day`],
          month: this.data[`${DATE_OF_UPDATE_FIELD}-month`],
          year: this.data[`${DATE_OF_UPDATE_FIELD}-year`]
        },
        uiErrors,
        DATE_OF_UPDATE_FIELD,
        this.dateOfUpdateErrorMessages,
        this.data.registration_date
      );

      return uiErrors;
    }

    this.validateForename(uiErrors);
    this.validateSurname(uiErrors);
    this.validatePreviousName(uiErrors);
    this.validateFormerNames(uiErrors);

    validateDate(
      {
        day: this.data[`${DATE_OF_BIRTH_FIELD}-day`],
        month: this.data[`${DATE_OF_BIRTH_FIELD}-month`],
        year: this.data[`${DATE_OF_BIRTH_FIELD}-year`]
      },
      uiErrors,
      DATE_OF_BIRTH_FIELD,
      this.dateOfBirthErrorMessages
    );

    if (isAddPartnerPage(this.data.pageType) && this.data.journeyTypes.isPostTransition) {
      validateDate(
        {
          day: this.data[`${DATE_EFFECTIVE_FROM_FIELD}-day`],
          month: this.data[`${DATE_EFFECTIVE_FROM_FIELD}-month`],
          year: this.data[`${DATE_EFFECTIVE_FROM_FIELD}-year`]
        },
        uiErrors,
        DATE_EFFECTIVE_FROM_FIELD,
        this.dateEffectiveFromErrorMessages,
        this.data.registration_date
      );
    }

    this.validateNationalities(uiErrors);

    if (isCapitalContributionApplicable(this.data.journeyTypes, this.data.partnershipType, this.data.partnerType || ("" as PartnerType))) {
      capitalContributionValidation(
        {
          contribution_currency_type: this.data.contribution_currency_type,
          contribution_currency_value: this.data.contribution_currency_value,
          contribution_sub_types: this.data.contribution_sub_types
        },
        this.currencies,
        this.overrideCapitalContributionType.bind(this),
        uiErrors,
        this.errorMessages?.capitalContribution
      );
    }

    if (!this.data.journeyTypes?.isTransition && this.data.partnerType === PartnerType.generalPartner) {
      this.validateDisqualificationStatement(uiErrors);
    }

    return uiErrors;
  }

  private validateForename(uiErrors: UIErrors) {
    if (isFieldValueMissing(this.data.forename, FORENAME_FIELD, uiErrors, this.errorMessages?.firstNameMissing)) {
      return;
    }

    if (containsInvalidCharacters(this.data.forename, FORENAME_FIELD, uiErrors, this.errorMessages?.firstNameInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.data.forename, 50, FORENAME_FIELD, uiErrors, this.errorMessages?.firstNameTooLong)) {
      return;
    }
  }

  private validateSurname(uiErrors: UIErrors) {
    if (isFieldValueMissing(this.data.surname, SURNAME_FIELD, uiErrors, this.errorMessages?.lastNameMissing)) {
      return;
    }

    if (containsInvalidCharacters(this.data.surname, SURNAME_FIELD, uiErrors, this.errorMessages?.lastNameInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.data.surname, 160, SURNAME_FIELD, uiErrors, this.errorMessages?.lastNameTooLong)) {
      return;
    }
  }

  private validatePreviousName(uiErrors: UIErrors) {
    if (isFieldValueMissing(this.data.previous_name, PREVIOUS_NAME_FIELD, uiErrors, this.errorMessages?.previousNameNotSelected)) {
      return;
    }
  }

  private validateFormerNames(uiErrors: UIErrors) {
    if (
      (typeof this.data?.previous_name === "string" ?
        this.data?.previous_name?.trim() === "true"
        : this.data?.previous_name === true) &&
      isFieldValueMissing(this.data.former_names, FORMER_NAMES_FIELD, uiErrors, this.errorMessages?.formerNamesMissing)
    ) {
      return;
    }

    if (containsInvalidCharacters(this.data.former_names, FORMER_NAMES_FIELD, uiErrors, this.errorMessages?.formerNamesInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.data.former_names, 160, FORMER_NAMES_FIELD, uiErrors, this.errorMessages?.formerNamesTooLong)) {
      return;
    }
  }

  private validateNationalities(uiErrors: UIErrors) {
    if (isFieldValueMissing(this.data.nationality1, NATIONALITY1_FIELD, uiErrors, this.errorMessages?.nationality1Missing)) {
      return;
    }

    if (this.data.nationality1?.trim() && this.data.nationality2?.trim() && this.data.nationality2.trim() === this.data.nationality1?.trim()) {
      uiErrors.setWebError(NATIONALITY2_FIELD, this.errorMessages?.nationality2Same);
    }
  }

  private validateDisqualificationStatement(uiErrors: UIErrors) {
    if (!this.data.not_disqualified_statement_checked || this.data.not_disqualified_statement_checked === "false") {
      uiErrors.setWebError(
        NOT_DISQUALIFIED_STATEMENT_CHECKED_FIELD,
        this.errorMessages?.disqualificationStatementMissingGeneralPartner
      );
    }
  }

  private overrideCapitalContributionType(capitalContributionType: string): void {
    this.data.contribution_currency_type = capitalContributionType;
  }
}

export default PartnerPersonValidator;
