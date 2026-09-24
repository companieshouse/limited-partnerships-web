import {
  isAddPartnerPage as isAddPartnerPagePostTransition,
  isCeaseDatePage,
  isUpdatePartnerPage as isUpdatePartnerPagePostTransition,
  isWhenDidChangeUpdatePage
} from "../../presentation/controller/postTransition/pageType";
import { CEASE_DATE_FIELD, DATE_EFFECTIVE_FROM_FIELD, DATE_OF_UPDATE_FIELD, GOVERNING_LAW_FIELD, LEGAL_ENTITY_NAME_FIELD, LEGAL_ENTITY_REGISTER_NAME_FIELD, LEGAL_ENTITY_REGISTRATION_LOCATION_FIELD, LEGAL_FORM_FIELD, NOT_DISQUALIFIED_STATEMENT_CHECKED_FIELD, REGISTERED_COMPANY_NUMBER_FIELD } from "../../config";
import UIErrors from "../entities/UIErrors";
import { validateDate } from "./DateValidators";
import { buildDateOfUpdateErrorMessages } from "./dateOfUpdateErrorMessages";
import { capitalContributionValidation, isCapitalContributionApplicable } from "./capitalContributionValidator";
import { PartnerType } from "../types";
import { isFieldValueMissing, validateField } from "./FieldValidators";
import { isAddPartnerLegalEntityPage as isAddPartnerLegalEntityPageRegistration } from "../../presentation/controller/registration/PageType";
import { isAddPartnerLegalEntityPage as isAddPartnerLegalEntityPageTransition } from "../../presentation/controller/transition/PageType";

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

    if (this.isAddOrUpdatePartnerLegalEntityPage()) {
      this.validateLegalEntityPartner(uiErrors);
    }

    return uiErrors;
  }

  private isAddOrUpdatePartnerLegalEntityPage(): boolean {
    const pageType = this.data.pageType;
    return isAddPartnerLegalEntityPageRegistration(pageType)
      || isAddPartnerLegalEntityPageTransition(pageType)
      || isAddPartnerPagePostTransition(pageType)
      || isUpdatePartnerPagePostTransition(pageType);
  }

  private validateLegalEntityPartner(uiErrors: UIErrors) {
    // legal entity name
    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages?.legalEntityNameMissing,
        invalidMessage: this.errorMessages?.legalEntityNameInvalid,
        tooLongMessage: this.errorMessages?.legalEntityNameTooLong
      },
      LEGAL_ENTITY_NAME_FIELD,
      this.data.legal_entity_name
    );

    // legal form
    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages?.legalFormMissing,
        invalidMessage: this.errorMessages?.legalFormInvalid,
        tooLongMessage: this.errorMessages?.legalFormTooLong
      },
      LEGAL_FORM_FIELD,
      this.data.legal_form,
    );

    // governing law
    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages?.governingLawMissing,
        invalidMessage: this.errorMessages?.governingLawInvalid,
        tooLongMessage: this.errorMessages?.governingLawTooLong
      },
      GOVERNING_LAW_FIELD,
      this.data.governing_law
    );

    // register
    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages?.legalEntityRegisterNameMissing,
        invalidMessage: this.errorMessages?.legalEntityRegisterNameInvalid,
        tooLongMessage: this.errorMessages?.legalEntityRegisterNameTooLong
      },
      LEGAL_ENTITY_REGISTER_NAME_FIELD,
      this.data.legal_entity_register_name,
    );

    // country registered
    this.validateRegistrationLocation(uiErrors);

    // registration number
    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages?.registeredCompanyNumberMissing,
        invalidMessage: this.errorMessages?.registeredCompanyNumberInvalid,
        tooLongMessage: this.errorMessages?.registeredCompanyNumberTooLong
      },
      REGISTERED_COMPANY_NUMBER_FIELD,
      this.data.registered_company_number
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

  private validateRegistrationLocation(uiErrors: UIErrors) {
    if (isFieldValueMissing(uiErrors, this.errorMessages?.legalEntityCountryRegisteredMissing, LEGAL_ENTITY_REGISTRATION_LOCATION_FIELD, this.data.legal_entity_registration_location)) {
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
    return this.data.journeyTypes?.isPostTransition && isAddPartnerPagePostTransition(this.data.pageType);
  }

  private isDisqualifiedStatementValidationRequired(): boolean {
    return (
      this.data.partnerType === PartnerType.generalPartner
      && !this.data.journeyTypes?.isTransition
      && isAddPartnerPagePostTransition(this.data.pageType)
    );
  }
}

export default PartnerLegalEntityValidator;
