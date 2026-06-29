import UIErrors from "../entities/UIErrors";

class SicCodesValidator {
  readonly errorKey = "sic_codes";

  addSicCode(sicCodes: Array<{ code: string; description: string }>, sicCode: string, i18n: Record<string, any>): UIErrors {
    const uiErrors = new UIErrors();

    if (sicCodes.map((sic) => sic.code).includes(sicCode)){
      uiErrors.setWebError(this.errorKey, i18n.errorMessages.sicCodes.sicCodeDuplicate);
    }

    if (sicCodes.length >= 4) {
      uiErrors.setWebError(this.errorKey, i18n.errorMessages.sicCodes.maxSicCodes);
    }

    if (sicCodes.map((sic) => sic.code).includes(sicCode)) {
      uiErrors.setWebError(this.errorKey, i18n.errorMessages.sicCodes.sicCodeDuplicate);
    }

    const sicDescription = i18n.sicCodes.condensedSicCodes[sicCode]?.sicDescription ?? "";

    if (!sicDescription) {
      uiErrors.setWebError(this.errorKey, i18n.errorMessages.sicCodes.sicCodeInvalid);
    }

    return uiErrors;
  }
}

export default SicCodesValidator;
