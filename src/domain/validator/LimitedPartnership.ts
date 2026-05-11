import { NameEndingType, PartnershipType, Term } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { VALID_CHARACTERS_REGEX } from "../../config/constants";
import UIErrors from "../entities/UIErrors";

class LimitedPartnershipValidator {
  private partnership_type?: PartnershipType;
  private partnership_name?: string;
  private name_ending?: NameEndingType;
  private term?: Term;

  private errorMessages: Record<string, any> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.partnership_type = data.partnership_type;
    this.partnership_name = data.partnership_name;
    this.name_ending = data.name_ending;
    this.term = data.term;

    this.errorMessages = i18n?.errorMessages?.limitedPartnership || {};

    return this;
  }

  // Partnership Type
  public runPartnershipTypeValidation(): UIErrors {
    const uiErrors = new UIErrors();

    this.partnershipTypeEmpty(uiErrors);
    this.isValidPartnershipType(uiErrors);

    return uiErrors;
  }

  private partnershipTypeEmpty(uiErrors: UIErrors): UIErrors {
    if (!this.partnership_type) {
      uiErrors.setWebError("partnership_type", this.errorMessages?.partnershipType?.typeRequired);
    }
    return uiErrors;
  }

  private isValidPartnershipType(uiErrors: UIErrors): UIErrors {
    if (this.partnership_type && !Object.values(PartnershipType).includes(this.partnership_type)) {
      uiErrors.setWebError("partnership_type", this.errorMessages?.partnershipType?.typeRequired);
    }
    return uiErrors;
  }

  // Partnership Name
  public runNameValidation(): UIErrors {
    const uiErrors = new UIErrors();

    this.isEmpty(uiErrors);
    this.isValidCharacters(uiErrors);
    this.checkPartnershipNameLength(uiErrors);
    return uiErrors;
  }

  private isEmpty(uiErrors: UIErrors): UIErrors {
    if (!this.partnership_name?.trim()) {
      uiErrors.setWebError("partnership_name", this.errorMessages?.name?.nameRequired);
    }
    if (!this.name_ending){
      uiErrors.setWebError("name_ending", this.errorMessages?.name?.nameEndingRequired);
    }
    return uiErrors;
  }

  private isValidCharacters(uiErrors: UIErrors): UIErrors {
    const conditionNotMet = (value: string) => !VALID_CHARACTERS_REGEX.test(value);

    if (this.partnership_name && conditionNotMet(this.partnership_name)) {
      uiErrors.setWebError("partnership_name", this.errorMessages?.name?.nameInvalid);
    }
    return uiErrors;
  }

  private checkPartnershipNameLength(uiErrors: UIErrors): UIErrors {
    const partnershipNameMaxLength = 160;
    const partnershipName = this.partnership_name?.trim() ?? "";
    const partnershipNameWithEnding = `${partnershipName} ${this.name_ending}`;

    if (partnershipName && partnershipNameWithEnding.length > partnershipNameMaxLength) {
      uiErrors.setWebError("partnership_name", this.errorMessages?.name?.nameLength);
    }
    return uiErrors;
  }

  // Term
  public runTermValidation(): UIErrors {
    const uiErrors = new UIErrors();

    this.termEmpty(uiErrors);
    this.isValidTerm(uiErrors);

    return uiErrors;
  }

  private isValidTerm(uiErrors: UIErrors): UIErrors {
    if (this.term && !Object.values(Term).includes(this.term)) {
      uiErrors.setWebError("term", this.errorMessages?.term?.termRequired);
    }
    return uiErrors;
  }

  private termEmpty(uiErrors: UIErrors): UIErrors {
    if (!this.term) {
      uiErrors.setWebError("term", this.errorMessages?.term?.termRequired);
    }
    return uiErrors;
  }
}

export default LimitedPartnershipValidator;
