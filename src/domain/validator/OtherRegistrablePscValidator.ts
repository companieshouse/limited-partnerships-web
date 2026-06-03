import UIErrors from "../entities/UIErrors";
import { LEGAL_ENTITY_NAME_FIELD, LEGAL_FORM_FIELD, GOVERNING_LAW_FIELD } from "../../config/constants";
import { containsInvalidCharacters, isFieldValueTooLong } from "./FieldValidators";

type PscFormData = {
  legal_entity_name?: string;
  legal_form?: string;
  governing_law?: string;
  type?: string;
};

export default class OtherRegistrablePscValidator {
  private legal_entity_name?: string;
  private legal_form?: string;
  private governing_law?: string;
  private errorMessages: Record<string, string> = {};

  set(data: PscFormData, i18n: any): this {
    this.legal_entity_name = data.legal_entity_name;
    this.legal_form = data.legal_form;
    this.governing_law = data.governing_law;
    this.errorMessages = i18n?.errorMessages?.personWithSignificantControl?.addOtherRegistrablePerson || {};
    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    this.validateLegalEntityName(uiErrors);
    this.validateLegalForm(uiErrors);
    this.validateGoverningLaw(uiErrors);
    return uiErrors;
  }

  private validateLegalEntityName(uiErrors: UIErrors): void {
    if (!this.legal_entity_name?.trim()) {
      uiErrors.setWebError(LEGAL_ENTITY_NAME_FIELD, this.errorMessages?.legalEntityNameMissing);
    } else {
      containsInvalidCharacters(this.legal_entity_name, LEGAL_ENTITY_NAME_FIELD, uiErrors, this.errorMessages?.legalEntityNameInvalid);
      isFieldValueTooLong(this.legal_entity_name, 160, LEGAL_ENTITY_NAME_FIELD, uiErrors, this.errorMessages?.legalEntityNameTooLong);
    }
  }

  private validateLegalForm(uiErrors: UIErrors): void {
    if (!this.legal_form?.trim()) {
      uiErrors.setWebError(LEGAL_FORM_FIELD, this.errorMessages?.legalFormMissing);
    } else {
      containsInvalidCharacters(this.legal_form, LEGAL_FORM_FIELD, uiErrors, this.errorMessages?.legalFormInvalid);
      isFieldValueTooLong(this.legal_form, 160, LEGAL_FORM_FIELD, uiErrors, this.errorMessages?.legalFormTooLong);
    }
  }

  private validateGoverningLaw(uiErrors: UIErrors): void {
    if (!this.governing_law?.trim()) {
      uiErrors.setWebError(GOVERNING_LAW_FIELD, this.errorMessages?.governingLawMissing);
    } else {
      containsInvalidCharacters(this.governing_law, GOVERNING_LAW_FIELD, uiErrors, this.errorMessages?.governingLawInvalid);
      isFieldValueTooLong(this.governing_law, 160, GOVERNING_LAW_FIELD, uiErrors, this.errorMessages?.governingLawTooLong);
    }
  }
};
