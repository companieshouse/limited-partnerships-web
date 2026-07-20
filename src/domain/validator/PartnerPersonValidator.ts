import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import { capitalContributionValidation, isCapitalContributionApplicable } from "./capitalContributionValidator";
import { FORENAME_FIELD, FORMER_NAMES_FIELD, NATIONALITY1_FIELD, NATIONALITY2_FIELD, NOT_DISQUALIFIED_STATEMENT_CHECKED_FIELD, PREVIOUS_NAME_FIELD, SURNAME_FIELD } from "../../config";
import { JourneyTypes } from "../entities/journey";
import UIErrors from "../entities/UIErrors";
import { PartnerType, PartnerEntityType } from "../types";
import { DateErrorMessages, validateDateOfBirth } from "./DateValidators";
import { containsInvalidCharacters, isFieldValueMissing, isFieldValueTooLong } from "./FieldValidators";

class PartnerPersonValidator {
  private forename?: string;
  private surname?: string;
  private previousName?: string;
  private formerNames?: string;
  private dateOfBirthDay?: string;
  private dateOfBirthMonth?: string;
  private dateOfBirthYear?: string;
  private nationality1?: string;
  private nationality2?: string;
  private not_disqualified_statement_checked?: boolean | string;
  private dateEffectiveFromDay?: string;
  private dateEffectiveFromMonth?: string;
  private dateEffectiveFromYear?: string;
  private journeyTypes: JourneyTypes = {} as JourneyTypes;
  private partnerType?: PartnerType;
  private partnerEntityType?: PartnerEntityType;
  private partnershipType: PartnershipType = {} as PartnershipType;

  private contribution_currency_type?: string;
  private contribution_currency_value?: string;
  private contribution_sub_types?: string[];

  private errorMessages: Record<string, any> = {};

  private dateOfBirthErrorMessages: DateErrorMessages = {} as DateErrorMessages;

  set(data: Record<string, any>, i18n: any): this {
    this.forename = data.forename;
    this.surname = data.surname;
    this.previousName = data.previous_name;
    this.formerNames = data.former_names;
    this.dateOfBirthDay = data['date_of_birth-day'];
    this.dateOfBirthMonth = data['date_of_birth-month'];
    this.dateOfBirthYear = data['date_of_birth-year'];
    this.nationality1 = data.nationality1;
    this.nationality2 = data.nationality2;
    this.not_disqualified_statement_checked = data.not_disqualified_statement_checked;
    this.dateEffectiveFromDay = data['date_effective_from-day'];
    this.dateEffectiveFromMonth = data['date_effective_from-month'];
    this.dateEffectiveFromYear = data['date_effective_from-year'];

    this.contribution_currency_type = data.contribution_currency_type;
    this.contribution_currency_value = data.contribution_currency_value;
    this.contribution_sub_types = data.contribution_sub_types;

    this.journeyTypes = data.journeyTypes;
    this.partnerType = data.partnerType;
    this.partnerEntityType = data.partnerEntityType;
    this.partnershipType = data.partnershipType;

    this.errorMessages = {
      ...i18n?.errorMessages?.partners?.addPartner,
      capitalContribution: {
        ...i18n?.errorMessages?.capitalContribution
      }
    };

    const dateOfBirthErrors = (i18n?.errorMessages?.dateOfBirth ?? {}) as Partial<DateErrorMessages>;
    this.dateOfBirthErrorMessages = {
      ...dateOfBirthErrors,
      dateMissing: this.errorMessages?.dateOfBirthMissing
    } as DateErrorMessages;

    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    this.validateForename(uiErrors);
    this.validateSurname(uiErrors);
    this.validatePreviousName(uiErrors);
    this.validateFormerNames(uiErrors);
    validateDateOfBirth(this.dateOfBirthDay, this.dateOfBirthMonth, this.dateOfBirthYear, uiErrors, this.dateOfBirthErrorMessages);
    this.validateNationalities(uiErrors);

    if (isCapitalContributionApplicable(this.journeyTypes, this.partnershipType, this.partnerType || "" as PartnerType)) {
      capitalContributionValidation(
        {
          contribution_currency_type: this.contribution_currency_type,
          contribution_currency_value: this.contribution_currency_value,
          contribution_sub_types: this.contribution_sub_types
        },
        uiErrors,
        this.errorMessages?.capitalContribution);
    }

    if (!this.journeyTypes?.isTransition && this.partnerType === PartnerType.generalPartner) {
      this.validateDisqualificationStatement(uiErrors);
    }

    // TODO
    // if (this.journeyTypes?.isPostTransition) {
    //    validate date effective from
    // }

    return uiErrors;
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

  private validatePreviousName(uiErrors: UIErrors) {
    if (isFieldValueMissing(this.previousName, PREVIOUS_NAME_FIELD, uiErrors, this.errorMessages?.previousNameNotSelected)) {
      return;
    }
  }

  private validateFormerNames(uiErrors: UIErrors) {
    if (this.previousName?.trim() === 'true' && isFieldValueMissing(this.formerNames, FORMER_NAMES_FIELD, uiErrors, this.errorMessages?.formerNamesMissing)) {
      return;
    }

    if (containsInvalidCharacters(this.formerNames, FORMER_NAMES_FIELD, uiErrors, this.errorMessages?.formerNamesInvalid)) {
      return;
    }

    if (isFieldValueTooLong(this.formerNames, 160, FORMER_NAMES_FIELD, uiErrors, this.errorMessages?.formerNamesTooLong)) {
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

  private validateDisqualificationStatement(uiErrors: UIErrors) {
    if (!this.not_disqualified_statement_checked || this.not_disqualified_statement_checked === "false") {
      uiErrors.setWebError(NOT_DISQUALIFIED_STATEMENT_CHECKED_FIELD, this.errorMessages?.disqualificationStatementMissingGeneralPartner);
    }
  }
}

export default PartnerPersonValidator;
