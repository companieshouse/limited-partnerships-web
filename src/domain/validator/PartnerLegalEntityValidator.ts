import {
  isAddPartnerPage,
  isCeaseDatePage,
  isWhenDidChangeUpdatePage
} from "../../presentation/controller/postTransition/pageType";
import { CEASE_DATE_FIELD, DATE_EFFECTIVE_FROM_FIELD, DATE_OF_UPDATE_FIELD, GOVERNING_LAW_FIELD, LEGAL_ENTITY_NAME_FIELD, LEGAL_ENTITY_REGISTER_NAME_FIELD, LEGAL_ENTITY_REGISTRATION_LOCATION_FIELD, LEGAL_FORM_FIELD, NOT_DISQUALIFIED_STATEMENT_CHECKED_FIELD, REGISTERED_COMPANY_NUMBER_FIELD } from "../../config";
import UIErrors from "../entities/UIErrors";
import { validateDate } from "./DateValidators";
import { buildDateOfUpdateErrorMessages } from "./dateOfUpdateErrorMessages";
import { capitalContributionValidation, isCapitalContributionApplicable } from "./capitalContributionValidator";
import { PartnerType } from "../types";
import { containsInvalidCharacters, isFieldValueMissing, isFieldValueTooLong } from "./FieldValidators";

class PartnerLegalEntityValidator {
  private data: Record<string, any> = {};

  private dateEffectiveFromErrorMessages: Record<string, string> = {};
  private ceaseDateErrorMessages: Record<string, string> = {};
  private dateOfUpdateErrorMessages: Record<string, string> = {};

  private currencies: Record<string, any> = {};
  private errorMessages: Record<string, any> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;

    this.ceaseDateErrorMessages = i18n?.errorMessages?.ceaseDate ?? {};
    this.dateEffectiveFromErrorMessages = i18n?.errorMessages?.dateEffectiveFrom ?? {};
    this.dateOfUpdateErrorMessages = buildDateOfUpdateErrorMessages(data.pageType, i18n);
    this.currencies = i18n?.currencies || {};
    this.errorMessages = {
      ...i18n?.errorMessages?.partners?.addPartner,
      capitalContribution: {
        ...i18n?.errorMessages?.capitalContribution
      }
    };

    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();

    if (isCeaseDatePage(this.data.pageType)) {
      this.validateDateField(uiErrors, CEASE_DATE_FIELD, this.ceaseDateErrorMessages);
      return uiErrors;
    }

    if (isWhenDidChangeUpdatePage(this.data.pageType)) {
      this.validateDateField(uiErrors, DATE_OF_UPDATE_FIELD, this.dateOfUpdateErrorMessages, this.data.registration_date);
      return uiErrors;
    }

    // legal entity name
    this.validateField(
      this.data.legal_entity_name,
      LEGAL_ENTITY_NAME_FIELD,
      160,
      uiErrors,
      this.errorMessages?.legalEntityNameMissing,
      this.errorMessages?.legalEntityNameInvalid,
      this.errorMessages?.legalEntityNameTooLong
    );

    // legal form
    this.validateField(
      this.data.legal_form,
      LEGAL_FORM_FIELD,
      160,
      uiErrors,
      this.errorMessages?.legalFormMissing,
      this.errorMessages?.legalFormInvalid,
      this.errorMessages?.legalFormTooLong
    );

    // governing law
    this.validateField(
      this.data.governing_law,
      GOVERNING_LAW_FIELD,
      160,
      uiErrors,
      this.errorMessages?.governingLawMissing,
      this.errorMessages?.governingLawInvalid,
      this.errorMessages?.governingLawTooLong
    );

    // register
    this.validateField(
      this.data.legal_entity_register_name,
      LEGAL_ENTITY_REGISTER_NAME_FIELD,
      160,
      uiErrors,
      this.errorMessages?.legalEntityRegisterNameMissing,
      this.errorMessages?.legalEntityRegisterNameInvalid,
      this.errorMessages?.legalEntityRegisterNameTooLong
    );

    // country registered
    this.validateRegistrationLocation(uiErrors);

    // registration number
    this.validateField(
      this.data.registered_company_number,
      REGISTERED_COMPANY_NUMBER_FIELD,
      160,
      uiErrors,
      this.errorMessages?.registeredCompanyNumberMissing,
      this.errorMessages?.registeredCompanyNumberInvalid,
      this.errorMessages?.registeredCompanyNumberTooLong
    );

    // contributions
    if (
      isCapitalContributionApplicable(
        this.data.journeyTypes,
        this.data.partnershipType,
        this.data.partnerType || ("" as PartnerType)
      )
    ) {
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

    // date effective from
    if (this.isDateEffectiveFromValidationRequired()) {
      this.validateDateField(
        uiErrors,
        DATE_EFFECTIVE_FROM_FIELD,
        this.dateEffectiveFromErrorMessages,
        this.data.registration_date
      );
    }

    // disqualified statement
    if (this.isDisqualifiedStatementValidationRequired()) {
      this.validateDisqualifiedStatement(uiErrors);
    }

    return uiErrors;
  }

  private overrideCapitalContributionType(capitalContributionType: string): void {
    this.data.contribution_currency_type = capitalContributionType;
  }

  private validateDateField(
    uiErrors: UIErrors,
    field: string,
    errorMessages: Record<string, string>,
    registrationDate?: string
  ): void {
    validateDate(
      {
        day: this.data[`${field}-day`],
        month: this.data[`${field}-month`],
        year: this.data[`${field}-year`]
      },
      uiErrors,
      field,
      errorMessages,
      registrationDate
    );
  }

  private validateField(fieldValue: string | undefined, fieldName: string, maxLength: number, uiErrors: UIErrors, missingMessage: string, invalidMessage: string, tooLongMessage: string) {
    if (isFieldValueMissing(fieldValue, fieldName, uiErrors, missingMessage)) {
      return;
    }

    if (containsInvalidCharacters(fieldValue, fieldName, uiErrors, invalidMessage)) {
      return;
    }

    if (isFieldValueTooLong(fieldValue, maxLength, fieldName, uiErrors, tooLongMessage)) {
      return;
    }
  }

  private validateRegistrationLocation(uiErrors: UIErrors) {
    console.log(this.data);
    if (isFieldValueMissing(this.data.legal_entity_registration_location, LEGAL_ENTITY_REGISTRATION_LOCATION_FIELD, uiErrors, this.errorMessages?.legalEntityCountryRegisteredMissing)) {
      return;
    }
  }

  private validateDisqualifiedStatement(uiErrors: UIErrors) {
    if (!this.data.not_disqualified_statement_checked || this.data.not_disqualified_statement_checked === "false") {
      uiErrors.setWebError(
        NOT_DISQUALIFIED_STATEMENT_CHECKED_FIELD,
        this.errorMessages?.disqualificationStatementMissingGeneralPartner
      );
    }
  }

  private isDateEffectiveFromValidationRequired(): boolean {
    return this.data.journeyTypes?.isPostTransition && isAddPartnerPage(this.data.pageType);
  }

  private isDisqualifiedStatementValidationRequired(): boolean {
    return (
      this.data.partnerType === PartnerType.generalPartner
      && !this.data.journeyTypes?.isTransition
      && isAddPartnerPage(this.data.pageType)
    );
  }
}

export default PartnerLegalEntityValidator;
