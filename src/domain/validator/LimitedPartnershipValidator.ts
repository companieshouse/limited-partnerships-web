import {
  Jurisdiction,
  NameEndingType,
  PartnershipType,
  Term
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { DATE_OF_UPDATE_FIELD, EMAIL_REGEX, VALID_CHARACTERS_REGEX } from "../../config/constants";
import UIErrors from "../entities/UIErrors";
import { validateDate } from "./DateValidators";
import { isWhenDidChangeUpdatePage } from "../../presentation/controller/postTransition/pageType";
import RegistrationPageType from "../../presentation/controller/registration/PageType";

class LimitedPartnershipValidator {
  private data: Record<string, any> = {};

  private errorMessages: Record<string, any> = {};
  private dateOfUpdateErrorMessages: Record<string, any> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;

    this.errorMessages = i18n?.errorMessages?.limitedPartnership || {};
    this.dateOfUpdateErrorMessages = i18n?.errorMessages?.dateOfUpdate || {};

    return this;
  }

  public runValidation(): UIErrors {
    const uiErrors = new UIErrors();

    this.handlePageSpecificValidation(uiErrors);

    return uiErrors;
  }

  private handlePageSpecificValidation(uiErrors: UIErrors): UIErrors {
    const pageTypeValidatorMap = new Map<RegistrationPageType, () => UIErrors>([
      [RegistrationPageType.partnershipType, () => this.runPartnershipTypeValidation(uiErrors)],
      [RegistrationPageType.partnershipName, () => this.runNameValidation(uiErrors)],
      [RegistrationPageType.jurisdiction, () => this.runJurisdictionValidation(uiErrors)],
      [RegistrationPageType.term, () => this.runTermValidation(uiErrors)],
      [RegistrationPageType.email, () => this.runEmailValidation(uiErrors)]
    ]);

    if (isWhenDidChangeUpdatePage(this.data.pageType)) {
      return this.runDateOfUpdateValidation(uiErrors);
    }

    return pageTypeValidatorMap.get(this.data.pageType as RegistrationPageType)?.() ?? uiErrors;
  }

  // Partnership Type
  private runPartnershipTypeValidation(uiErrors: UIErrors): UIErrors {
    if (!this.data.partnership_type || !Object.values(PartnershipType).includes(this.data.partnership_type)) {
      return uiErrors.setWebError("partnership_type", this.errorMessages?.partnershipType?.typeRequired);
    }

    return uiErrors;
  }

  // Partnership Name
  private runNameValidation(uiErrors: UIErrors): UIErrors {
    if (!this.data.partnership_name?.trim()) {
      uiErrors.setWebError("partnership_name", this.errorMessages?.name?.nameRequired);
    } else if (!VALID_CHARACTERS_REGEX.test(this.data.partnership_name)) {
      uiErrors.setWebError("partnership_name", this.errorMessages?.name?.nameInvalid);
    } else if (this.data.name_ending) {
      const partnershipNameMaxLength = 160;
      const partnershipName = this.data.partnership_name.trim();
      const partnershipNameWithEnding = `${partnershipName} ${this.data.name_ending}`;

      if (partnershipNameWithEnding.length > partnershipNameMaxLength) {
        uiErrors.setWebError("partnership_name", this.errorMessages?.name?.nameLength);
      }
    }

    if (!this.data.name_ending || !Object.values(NameEndingType).includes(this.data.name_ending)) {
      uiErrors.setWebError("name_ending", this.errorMessages?.name?.nameEndingRequired);
    }

    return uiErrors;
  }

  // Jurisdiction
  private runJurisdictionValidation(uiErrors: UIErrors): UIErrors {
    if (!this.data.jurisdiction || !Object.values(Jurisdiction).includes(this.data.jurisdiction)) {
      uiErrors.setWebError("jurisdiction", this.errorMessages?.jurisdiction?.required);
    }

    return uiErrors;
  }

  // Term
  private runTermValidation(uiErrors: UIErrors): UIErrors {
    if (!this.data.term || !Object.values(Term).includes(this.data.term)) {
      uiErrors.setWebError("term", this.errorMessages?.term?.termRequired);
    }

    return uiErrors;
  }

  // Email
  private runEmailValidation(uiErrors: UIErrors): UIErrors {
    if (!this.data.email?.trim()) {
      return uiErrors.setWebError("email", this.errorMessages?.email?.emailRequired);
    }

    const email = this.data.email?.trim() ?? "";

    if (email) {
      // Reject the malformed/oversized addresses the API rejects: local part > 64, domain label > 63 (regex), total > 255.
      const localPart = email.split("@")[0];
      const isValid = email.length <= 255 && localPart.length <= 64 && EMAIL_REGEX.test(email);

      if (!isValid) {
        uiErrors.setWebError("email", this.errorMessages?.email?.emailInvalid);
      }
    }

    return uiErrors;
  }

  // Date of Update
  private runDateOfUpdateValidation(uiErrors: UIErrors): UIErrors {
    validateDate(
      {
        day: this.data[`${DATE_OF_UPDATE_FIELD}-day`],
        month: this.data[`${DATE_OF_UPDATE_FIELD}-month`],
        year: this.data[`${DATE_OF_UPDATE_FIELD}-year`]
      },
      uiErrors,
      DATE_OF_UPDATE_FIELD,
      this.dateOfUpdateErrorMessages,
      this.data.registration_date,
      this.data.pageKey
    );

    return uiErrors;
  }
}

export default LimitedPartnershipValidator;
