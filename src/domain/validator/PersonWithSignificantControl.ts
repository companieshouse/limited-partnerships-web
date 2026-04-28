import { PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import UIErrors from "../entities/UIErrors";
import {
  GOVERNING_LAW_FIELD,
  LEGAL_ENTITY_NAME_FIELD,
  LEGAL_FORM_FIELD,
  VALID_CHARACTERS_REGEX
} from "../../config/constants";

type PscFormData = {
  type?: string;
  legal_entity_name?: string;
  legal_form?: string;
  governing_law?: string;
};

class PersonWithSignificantControlValidator {
  private type?: string;
  private legal_entity_name?: string;
  private legal_form?: string;
  private governing_law?: string;

  private errorMessages: Record<string, string> = {};

  set(data: PscFormData, i18n: any): this {
    this.type = data.type;
    this.legal_entity_name = data.legal_entity_name;
    this.legal_form = data.legal_form;
    this.governing_law = data.governing_law;

    this.errorMessages = i18n?.errorMessages?.personWithSignificantControl?.addOtherRegistrablePerson || {};

    return this;
  }

  public runValidation(): UIErrors {
    const uiErrors = new UIErrors();

    if (this.type !== PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON) {
      return uiErrors;
    }

    this.validateLegalEntityName(uiErrors);
    this.validateLegalForm(uiErrors);
    this.validateGoverningLaw(uiErrors);

    return uiErrors;
  }

  private validateLegalEntityName(uiErrors: UIErrors): void {
    if (!this.legal_entity_name?.trim()) {
      uiErrors.setWebError(LEGAL_ENTITY_NAME_FIELD, this.errorMessages?.legalEntityNameMissing);
    } else if (!VALID_CHARACTERS_REGEX.test(this.legal_entity_name)) {
      uiErrors.setWebError(LEGAL_ENTITY_NAME_FIELD, this.errorMessages?.legalEntityNameInvalid);
    }
  }

  private validateLegalForm(uiErrors: UIErrors): void {
    if (!this.legal_form?.trim()) {
      uiErrors.setWebError(LEGAL_FORM_FIELD, this.errorMessages?.legalFormMissing);
    } else if (!VALID_CHARACTERS_REGEX.test(this.legal_form)) {
      uiErrors.setWebError(LEGAL_FORM_FIELD, this.errorMessages?.legalFormInvalid);
    }
  }

  private validateGoverningLaw(uiErrors: UIErrors): void {
    if (!this.governing_law?.trim()) {
      uiErrors.setWebError(GOVERNING_LAW_FIELD, this.errorMessages?.governingLawMissing);
    }
  }
}

export default PersonWithSignificantControlValidator;
