import {
  isCeaseDatePage,
  isAddPartnerPage,
  isWhenDidChangeUpdatePage
} from "../../presentation/controller/postTransition/pageType";
import { CEASE_DATE_FIELD, DATE_EFFECTIVE_FROM_FIELD, DATE_OF_UPDATE_FIELD } from "../../config";
import UIErrors from "../entities/UIErrors";
import { validateDate } from "./DateValidators";
import { capitalContributionValidation, isCapitalContributionApplicable } from "./capitalContributionValidator";
import { PartnerType } from "../types";

class PartnerLegalEntityValidator {
  private data: Record<string, any> = {};

  private dateEffectiveFromErrorMessages: Record<string, string> = {};
  private ceaseDateErrorMessages: Record<string, string> = {};
  private dateOfUpdateErrorMessages: Record<string, string> = {};

  private currencies: Record<string, any> = {};
  private errorMessages: Record<string, any> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;

    this.ceaseDateErrorMessages = i18n?.errorMessages?.ceaseDate ?? {};
    this.dateEffectiveFromErrorMessages = i18n?.errorMessages?.dateEffectiveFrom ?? {};
    this.dateOfUpdateErrorMessages = i18n?.errorMessages?.dateOfUpdate ?? {};

    this.currencies = i18n?.currencies || {};
    this.errorMessages = {
      ...i18n?.errorMessages?.partners?.addPartner,
      capitalContribution: {
        ...i18n?.errorMessages?.capitalContribution
      }
    };

    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();

    if (isCeaseDatePage(this.data.pageType)) {
      validateDate(
        {
          day: this.data[`${CEASE_DATE_FIELD}-day`],
          month: this.data[`${CEASE_DATE_FIELD}-month`],
          year: this.data[`${CEASE_DATE_FIELD}-year`]
        },
        uiErrors,
        CEASE_DATE_FIELD,
        this.ceaseDateErrorMessages
      );
    }

    if (isAddPartnerPage(this.data.pageType) && this.data.journeyTypes.isPostTransition) {
      validateDate(
        {
          day: this.data[`${DATE_EFFECTIVE_FROM_FIELD}-day`],
          month: this.data[`${DATE_EFFECTIVE_FROM_FIELD}-month`],
          year: this.data[`${DATE_EFFECTIVE_FROM_FIELD}-year`]
        },
        uiErrors,
        DATE_EFFECTIVE_FROM_FIELD,
        this.dateEffectiveFromErrorMessages,
        this.data.registration_date
      );
    }

    if (isWhenDidChangeUpdatePage(this.data.pageType)) {
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
    }

    if (
      isCapitalContributionApplicable(
        this.data.journeyTypes,
        this.data.partnershipType,
        this.data.partnerType || ("" as PartnerType)
      )
    ) {
      capitalContributionValidation(
        {
          contribution_currency_type: this.data.contribution_currency_type,
          contribution_currency_value: this.data.contribution_currency_value,
          contribution_sub_types: this.data.contribution_sub_types
        },
        this.currencies,
        this.overrideCapitalContributionType.bind(this),
        uiErrors,
        this.errorMessages?.capitalContribution
      );
    }

    return uiErrors;
  }

  private overrideCapitalContributionType(capitalContributionType: string): void {
    this.data.contribution_currency_type = capitalContributionType;
  }
}

export default PartnerLegalEntityValidator;
