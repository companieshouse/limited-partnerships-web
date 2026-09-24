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
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.legalEntityNameMissing,
        invalidMessage: this.errorMessages.legalEntityNameInvalid,
        tooLongMessage: this.errorMessages.legalEntityNameTooLong
      },
      LEGAL_ENTITY_NAME_FIELD,
      this.data.legal_entity_name
    );

    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.legalFormMissing,
        invalidMessage: this.errorMessages.legalFormInvalid,
        tooLongMessage: this.errorMessages.legalFormTooLong
      },
      LEGAL_FORM_FIELD,
      this.data.legal_form
    );

    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.governingLawMissing,
        invalidMessage: this.errorMessages.governingLawInvalid,
        tooLongMessage: this.errorMessages.governingLawTooLong
      },
      GOVERNING_LAW_FIELD,
      this.data.governing_law
    );

    this.validateEnteredOnRegister(uiErrors);
    this.validateLegalEntityRegistrationLocation(uiErrors);
    this.validateLegalEntityRegisterName(uiErrors);
    this.validateRegisteredCompanyNumber(uiErrors);

    return uiErrors;
  }

  private validateEnteredOnRegister(uiErrors: UIErrors): void {
    if (isFieldValueMissing(uiErrors, this.errorMessages.enteredOnRegisterMissing, ENTERED_ON_REGISTER_FIELD, this.data.entered_on_register)) {
      return;
    }
  }

  private validateLegalEntityRegistrationLocation(uiErrors: UIErrors): void {
    if (this.isEnteredOnRegister() && isFieldValueMissing(uiErrors, this.errorMessages.legalEntityRegistrationLocationMissing, LEGAL_ENTITY_REGISTRATION_LOCATION_FIELD, this.data.legal_entity_registration_location)) {
      return;
    }
  }

  private validateLegalEntityRegisterName(uiErrors: UIErrors): void {
    if (!this.isEnteredOnRegister()) {
      return;
    }

    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.legalEntityRegisterNameMissing,
        invalidMessage: this.errorMessages.legalEntityRegisterNameInvalid,
        tooLongMessage: this.errorMessages.legalEntityRegisterNameTooLong
      },
      LEGAL_ENTITY_REGISTER_NAME_FIELD,
      this.data.legal_entity_register_name
    );
  }

  private validateRegisteredCompanyNumber(uiErrors: UIErrors): void {
    if (!this.isEnteredOnRegister()) {
      return;
    }

    validateField(
      160,
      uiErrors,
      {
        missingMessage: this.errorMessages.registeredCompanyNumberMissing,
        invalidMessage: this.errorMessages.registeredCompanyNumberInvalid,
        tooLongMessage: this.errorMessages.registeredCompanyNumberTooLong
      },
      REGISTERED_COMPANY_NUMBER_FIELD,
      this.data.registered_company_number
    );
  }

  private isEnteredOnRegister(): boolean {
    return this.data.entered_on_register === 'true';
  }
}
