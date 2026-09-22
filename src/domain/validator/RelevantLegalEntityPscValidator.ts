import { ENTERED_ON_REGISTER_FIELD, GOVERNING_LAW_FIELD, LEGAL_ENTITY_NAME_FIELD, LEGAL_ENTITY_REGISTER_NAME_FIELD, LEGAL_ENTITY_REGISTRATION_LOCATION_FIELD, LEGAL_FORM_FIELD, REGISTERED_COMPANY_NUMBER_FIELD } from "../../config";
import UIErrors from "../entities/UIErrors";
import { isFieldValueMissing, validateField } from "./FieldValidators";

export default class RelevantLegalEntityPscValidator {
  private data: Record<string, any> = {};
  private errorMessages: Record<string, string> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;
    this.errorMessages = {
      ...i18n.errorMessages.personWithSignificantControl.addRelevantLegalEntity,
      ...i18n.errorMessages.personWithSignificantControl.sharedLegalDetails
    };
    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();

    validateField(
      this.data.legal_entity_name,
      LEGAL_ENTITY_NAME_FIELD,
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.legalEntityNameMissing,
        invalidMessage: this.errorMessages.legalEntityNameInvalid,
        tooLongMessage: this.errorMessages.legalEntityNameTooLong
      }
    );

    validateField(
      this.data.legal_form,
      LEGAL_FORM_FIELD,
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.legalFormMissing,
        invalidMessage: this.errorMessages.legalFormInvalid,
        tooLongMessage: this.errorMessages.legalFormTooLong
      }
    );

    validateField(
      this.data.governing_law,
      GOVERNING_LAW_FIELD,
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.governingLawMissing,
        invalidMessage: this.errorMessages.governingLawInvalid,
        tooLongMessage: this.errorMessages.governingLawTooLong
      }
    );

    this.validateEnteredOnRegister(uiErrors);
    this.validateLegalEntityRegistrationLocation(uiErrors);
    this.validateLegalEntityRegisterName(uiErrors);
    this.validateRegisteredCompanyNumber(uiErrors);

    return uiErrors;
  }

  private validateEnteredOnRegister(uiErrors: UIErrors): void {
    if (isFieldValueMissing(this.data.entered_on_register, ENTERED_ON_REGISTER_FIELD, uiErrors, this.errorMessages.enteredOnRegisterMissing)) {
      return;
    }
  }

  private validateLegalEntityRegistrationLocation(uiErrors: UIErrors): void {
    if (this.isEnteredOnRegister() && isFieldValueMissing(this.data.legal_entity_registration_location, LEGAL_ENTITY_REGISTRATION_LOCATION_FIELD, uiErrors, this.errorMessages.legalEntityRegistrationLocationMissing)) {
      return;
    }
  }

  private validateLegalEntityRegisterName(uiErrors: UIErrors): void {
    if (!this.isEnteredOnRegister()) {
      return;
    }

    validateField(
      this.data.legal_entity_register_name,
      LEGAL_ENTITY_REGISTER_NAME_FIELD,
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.legalEntityRegisterNameMissing,
        invalidMessage: this.errorMessages.legalEntityRegisterNameInvalid,
        tooLongMessage: this.errorMessages.legalEntityRegisterNameTooLong
      }
    );
  }

  private validateRegisteredCompanyNumber(uiErrors: UIErrors): void {
    if (!this.isEnteredOnRegister()) {
      return;
    }

    validateField(
      this.data.registered_company_number,
      REGISTERED_COMPANY_NUMBER_FIELD,
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.registeredCompanyNumberMissing,
        invalidMessage: this.errorMessages.registeredCompanyNumberInvalid,
        tooLongMessage: this.errorMessages.registeredCompanyNumberTooLong
      }
    );
  }

  private isEnteredOnRegister(): boolean {
    return this.data.entered_on_register === 'true';
  }
}
