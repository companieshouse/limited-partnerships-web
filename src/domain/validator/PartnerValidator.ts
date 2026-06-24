
import UIErrors from "../entities/UIErrors";
import { PartnerEntityType } from "../types";
import PartnerPersonValidator from "./PartnerPersonValidator";

export default class PartnerValidator {
  private delegate: any;

  set(data: Record<string, any>, i18n: any): this {
    // TODO create PartnerLegalEntityValidator and set delegate to it if partnerEntityType is legal entity
    // Then inside each one, use partnerType and journeType to determine which fields to validate as some fields are only relevant for certain partner types (e.g. not_disqualified_statement_checked is only relevant for general partner person)

    // data.partnerType and data.partnerEntityType are set/defined on the pageRouting data

    this.delegate = null;

    if (data.partnerEntityType === PartnerEntityType.person) {
      this.delegate = new PartnerPersonValidator().set(data, i18n);
    }
    return this;
  }

  runValidation(): UIErrors {
    if (this.delegate && typeof this.delegate.runValidation === "function") {
      return this.delegate.runValidation();
    }
    return new UIErrors();
  }
}

