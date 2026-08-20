import { Jurisdiction, NameEndingType, PartnershipType, Term } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { DATE_OF_UPDATE_FIELD, EMAIL_REGEX, VALID_CHARACTERS_REGEX } from "../../config/constants";
import UIErrors from "../entities/UIErrors";
import { validateDate } from "./DateValidators";
import PostTransitionPageType from "../../presentation/controller/postTransition/pageType";
import RegistrationPageType from "../../presentation/controller/registration/PageType";

class LimitedPartnershipValidator {
  private data: Record<string, any> = {};
  private partnership_type?: PartnershipType;
  private partnership_name?: string;
  private name_ending?: NameEndingType;
  private jurisdiction?: Jurisdiction;
  private term?: Term;
  private email?: string;

  private date_of_update_day?: string;
  private date_of_update_month?: string;
  private date_of_update_year?: string;

  private registration_date?: string;
  private pageKey?: string;

  private errorMessages: Record<string, any> = {};
  private dateOfUpdateErrorMessages: Record<string, any> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;
    this.partnership_type = data.partnership_type;
    this.partnership_name = data.partnership_name;
    this.name_ending = data.name_ending;
    this.jurisdiction = data.jurisdiction;
    this.term = data.term;
    this.email = data.email;

    this.date_of_update_day = data[`${DATE_OF_UPDATE_FIELD}-day`];
    this.date_of_update_month = data[`${DATE_OF_UPDATE_FIELD}-month`];
    this.date_of_update_year = data[`${DATE_OF_UPDATE_FIELD}-year`];

    this.registration_date = data.registration_date;
    this.pageKey = data.pageKey;

    this.errorMessages = i18n?.errorMessages?.limitedPartnership || {};
    this.dateOfUpdateErrorMessages = i18n?.errorMessages?.dateOfUpdate || {};

    return this;
  }

  public runValidation(): UIErrors {
    const uiErrors = new UIErrors();

    if (
      this.data.pageType === PostTransitionPageType.whenDidTheRegisteredOfficeAddressChange ||
      this.data.pageType === PostTransitionPageType.whenDidTheTermChange
    ) {
      this.runDateOfUpdateValidation(uiErrors);
      return uiErrors;
    }

    this.handleValidation(uiErrors);

    return uiErrors;
  }

  private runDateOfUpdateValidation(uiErrors: UIErrors): UIErrors {
    validateDate(
      {
        day: this.date_of_update_day,
        month: this.date_of_update_month,
        year: this.date_of_update_year
      },
      uiErrors,
      DATE_OF_UPDATE_FIELD,
      this.dateOfUpdateErrorMessages,
      this.registration_date,
      this.pageKey
    );

    return uiErrors;
  }

  private handleValidation(uiErrors: UIErrors): UIErrors {
    const pageTypeValidatorMap = new Map<RegistrationPageType, () => UIErrors>([
      [RegistrationPageType.partnershipType, () => this.runPartnershipTypeValidation(uiErrors)],
      [RegistrationPageType.partnershipName, () => this.runNameValidation(uiErrors)],
      [RegistrationPageType.jurisdiction, () => this.runJurisdictionValidation(uiErrors)],
      [RegistrationPageType.term, () => this.runTermValidation(uiErrors)],
      [RegistrationPageType.email, () => this.runEmailValidation(uiErrors)]
    ]);

    return pageTypeValidatorMap.get(this.data.pageType as RegistrationPageType)?.() ?? uiErrors;
  }

  // Partnership Type
  public runPartnershipTypeValidation(uiErrors: UIErrors): UIErrors {
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
  public runNameValidation(uiErrors: UIErrors): UIErrors {
    this.isEmpty(uiErrors);
    this.isValidCharacters(uiErrors);
    this.checkPartnershipNameLength(uiErrors);
    return uiErrors;
  }

  private isEmpty(uiErrors: UIErrors): UIErrors {
    if (!this.partnership_name?.trim()) {
      uiErrors.setWebError("partnership_name", this.errorMessages?.name?.nameRequired);
    }
    if (!this.name_ending) {
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

  // Jurisdiction
  public runJurisdictionValidation(uiErrors: UIErrors): UIErrors {
    this.jurisdictionEmpty(uiErrors);
    this.isValidJurisdiction(uiErrors);

    return uiErrors;
  }

  private jurisdictionEmpty(uiErrors: UIErrors): UIErrors {
    if (!this.jurisdiction) {
      uiErrors.setWebError("jurisdiction", this.errorMessages?.jurisdiction?.required);
    }
    return uiErrors;
  }

  private isValidJurisdiction(uiErrors: UIErrors): UIErrors {
    if (this.jurisdiction && !Object.values(Jurisdiction).includes(this.jurisdiction)) {
      uiErrors.setWebError("jurisdiction", this.errorMessages?.jurisdiction?.required);
    }
    return uiErrors;
  }

  // Term
  public runTermValidation(uiErrors: UIErrors): UIErrors {
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

  // Email
  public runEmailValidation(uiErrors: UIErrors): UIErrors {
    this.emailEmpty(uiErrors);
    this.isValidEmail(uiErrors);

    return uiErrors;
  }

  private emailEmpty(uiErrors: UIErrors): UIErrors {
    if (!this.email?.trim()) {
      uiErrors.setWebError("email", this.errorMessages?.email?.emailRequired);
    }
    return uiErrors;
  }

  private isValidEmail(uiErrors: UIErrors): UIErrors {
    const email = this.email?.trim() ?? "";

    if (!email) {
      return uiErrors;
    }

    // Reject the malformed/oversized addresses the API rejects: local part > 64, domain label > 63 (regex), total > 255.
    const localPart = email.split("@")[0];
    const isValid = email.length <= 255 && localPart.length <= 64 && EMAIL_REGEX.test(email);

    if (!isValid) {
      uiErrors.setWebError("email", this.errorMessages?.email?.emailInvalid);
    }

    return uiErrors;
  }
}

export default LimitedPartnershipValidator;
