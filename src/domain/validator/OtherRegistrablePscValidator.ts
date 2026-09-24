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
    this.errorMessages = {
      ...i18n?.errorMessages?.personWithSignificantControl?.sharedLegalDetails,
      ...i18n?.errorMessages?.personWithSignificantControl?.addOtherRegistrablePerson
    };
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
      containsInvalidCharacters(uiErrors, this.errorMessages?.legalEntityNameInvalid, LEGAL_ENTITY_NAME_FIELD, this.legal_entity_name);
      isFieldValueTooLong(160, uiErrors, this.errorMessages?.legalEntityNameTooLong, LEGAL_ENTITY_NAME_FIELD, this.legal_entity_name);
    }
  }

  private validateLegalForm(uiErrors: UIErrors): void {
    if (!this.legal_form?.trim()) {
      uiErrors.setWebError(LEGAL_FORM_FIELD, this.errorMessages?.legalFormMissing);
    } else {
      containsInvalidCharacters(uiErrors, this.errorMessages?.legalFormInvalid, LEGAL_FORM_FIELD, this.legal_form);
      isFieldValueTooLong(160, uiErrors, this.errorMessages?.legalFormTooLong, LEGAL_FORM_FIELD, this.legal_form);
    }
  }

  private validateGoverningLaw(uiErrors: UIErrors): void {
    if (!this.governing_law?.trim()) {
      uiErrors.setWebError(GOVERNING_LAW_FIELD, this.errorMessages?.governingLawMissing);
    } else {
      containsInvalidCharacters(uiErrors, this.errorMessages?.governingLawInvalid, GOVERNING_LAW_FIELD, this.governing_law);
      isFieldValueTooLong(160, uiErrors, this.errorMessages?.governingLawTooLong, GOVERNING_LAW_FIELD, this.governing_law);
    }
  }
};
