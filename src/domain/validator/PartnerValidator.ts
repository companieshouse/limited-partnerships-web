
import UIErrors from "../entities/UIErrors";
import { PartnerEntityType } from "../types";
import PartnerLegalEntityValidator from "./PartnerLegalEntityValidator";
import PartnerPersonValidator from "./PartnerPersonValidator";

export default class PartnerValidator {
  private delegate: any;

  set(data: Record<string, any>, i18n: any): this {
    // data.partnerType and data.partnerEntityType are set/defined on the pageRouting data

    this.delegate = null;

    if (
      data?.partnerEntityType === PartnerEntityType.legalEntity ||
      data?.data?.partnerEntityType === PartnerEntityType.legalEntity
    ) {
      this.delegate = new PartnerLegalEntityValidator().set(data, i18n);
    }

    if (data?.partnerEntityType === PartnerEntityType.person || data?.data?.partnerEntityType === PartnerEntityType.person) {
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

