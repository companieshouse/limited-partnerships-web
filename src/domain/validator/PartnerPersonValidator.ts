import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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
import { JourneyTypes } from "../entities/journey";
import UIErrors from "../entities/UIErrors";
import { PartnerType, PartnerEntityType } from "../types";
import { validateDate } from "./DateValidators";
import { containsInvalidCharacters, isFieldValueMissing, isFieldValueTooLong } from "./FieldValidators";
import {
  isAddPartnerPage,
  isCeaseDatePage,
  isWhenDidChangeUpdatePage
} from "../../presentation/controller/postTransition/pageType";

class PartnerPersonValidator {
  private data: Record<string, any> = {};
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
  private ceaseDateDay?: string;
  private ceaseDateMonth?: string;
  private ceaseDateYear?: string;
  private journeyTypes: JourneyTypes = {} as JourneyTypes;
  private pageKey?: string;
  private partnerType?: PartnerType;
  private partnerEntityType?: PartnerEntityType;
  private partnershipType: PartnershipType = {} as PartnershipType;
  private dateOfUpdateDay?: string;
  private dateOfUpdateMonth?: string;
  private dateOfUpdateYear?: string;

  private contribution_currency_type?: string;
  private contribution_currency_value?: string;
  private contribution_sub_types?: string[];

  private registrationDate?: string;

  private errorMessages: Record<string, any> = {};

  private dateOfBirthErrorMessages: Record<string, string> = {};
  private dateEffectiveFromErrorMessages: Record<string, string> = {};
  private ceaseDateErrorMessages: Record<string, string> = {};
  private dateOfUpdateErrorMessages: Record<string, string> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;
    this.forename = data.forename;
    this.surname = data.surname;
    this.previousName = data.previous_name;
    this.formerNames = data.former_names;
    this.dateOfBirthDay = data[`${DATE_OF_BIRTH_FIELD}-day`];
    this.dateOfBirthMonth = data[`${DATE_OF_BIRTH_FIELD}-month`];
    this.dateOfBirthYear = data[`${DATE_OF_BIRTH_FIELD}-year`];
    this.nationality1 = data.nationality1;
    this.nationality2 = data.nationality2;
    this.not_disqualified_statement_checked = data.not_disqualified_statement_checked;
    this.dateEffectiveFromDay = data[`${DATE_EFFECTIVE_FROM_FIELD}-day`];
    this.dateEffectiveFromMonth = data[`${DATE_EFFECTIVE_FROM_FIELD}-month`];
    this.dateEffectiveFromYear = data[`${DATE_EFFECTIVE_FROM_FIELD}-year`];
    this.ceaseDateDay = data[`${CEASE_DATE_FIELD}-day`];
    this.ceaseDateMonth = data[`${CEASE_DATE_FIELD}-month`];
    this.ceaseDateYear = data[`${CEASE_DATE_FIELD}-year`];
    this.dateOfUpdateDay = data[`${DATE_OF_UPDATE_FIELD}-day`];
    this.dateOfUpdateMonth = data[`${DATE_OF_UPDATE_FIELD}-month`];
    this.dateOfUpdateYear = data[`${DATE_OF_UPDATE_FIELD}-year`];
    this.registrationDate = data.registration_date;
    this.contribution_currency_type = data.contribution_currency_type;
    this.contribution_currency_value = data.contribution_currency_value;
    this.contribution_sub_types = data.contribution_sub_types;

    this.journeyTypes = data.journeyTypes;
    this.pageKey = data.pageKey;
    this.partnerType = data.partnerType;
    this.partnerEntityType = data.partnerEntityType;
    this.partnershipType = data.partnershipType;

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
    this.dateOfUpdateErrorMessages = i18n?.errorMessages?.dateOfUpdate ?? {};

    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    if (isCeaseDatePage(this.data.pageType)) {
      validateDate(
        {
          day: this.ceaseDateDay,
          month: this.ceaseDateMonth,
          year: this.ceaseDateYear
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
          day: this.dateOfUpdateDay,
          month: this.dateOfUpdateMonth,
          year: this.dateOfUpdateYear
        },
        uiErrors,
        DATE_OF_UPDATE_FIELD,
        this.dateOfUpdateErrorMessages,
        this.registrationDate,
        this.pageKey
      );

      return uiErrors;
    }

    this.validateForename(uiErrors);
    this.validateSurname(uiErrors);
    this.validatePreviousName(uiErrors);
    this.validateFormerNames(uiErrors);

    validateDate(
      {
        day: this.dateOfBirthDay,
        month: this.dateOfBirthMonth,
        year: this.dateOfBirthYear
      },
      uiErrors,
      DATE_OF_BIRTH_FIELD,
      this.dateOfBirthErrorMessages
    );

    if (isAddPartnerPage(this.data.pageType) && this.journeyTypes.isPostTransition) {
      validateDate(
        {
          day: this.dateEffectiveFromDay,
          month: this.dateEffectiveFromMonth,
          year: this.dateEffectiveFromYear
        },
        uiErrors,
        DATE_EFFECTIVE_FROM_FIELD,
        this.dateEffectiveFromErrorMessages,
        this.registrationDate
      );
    }

    this.validateNationalities(uiErrors);

    if (isCapitalContributionApplicable(this.journeyTypes, this.partnershipType, this.partnerType || ("" as PartnerType))) {
      capitalContributionValidation(
        {
          contribution_currency_type: this.contribution_currency_type,
          contribution_currency_value: this.contribution_currency_value,
          contribution_sub_types: this.contribution_sub_types
        },
        uiErrors,
        this.errorMessages?.capitalContribution
      );
    }

    if (!this.journeyTypes?.isTransition && this.partnerType === PartnerType.generalPartner) {
      this.validateDisqualificationStatement(uiErrors);
    }

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
    if (
      this.previousName?.trim() === "true" &&
      isFieldValueMissing(this.formerNames, FORMER_NAMES_FIELD, uiErrors, this.errorMessages?.formerNamesMissing)
    ) {
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
      uiErrors.setWebError(
        NOT_DISQUALIFIED_STATEMENT_CHECKED_FIELD,
        this.errorMessages?.disqualificationStatementMissingGeneralPartner
      );
    }
  }
}

export default PartnerPersonValidator;
