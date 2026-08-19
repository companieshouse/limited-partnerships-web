import { isCeaseDatePage, isAddPartnerPage } from "../../presentation/controller/postTransition/pageType";
import { CEASE_DATE_FIELD, DATE_EFFECTIVE_FROM_FIELD } from "../../config";
import { JourneyTypes } from "../entities/journey";
import UIErrors from "../entities/UIErrors";
import { validateDate } from "./DateValidators";

class PartnerLegalEntityValidator {
  private data: Record<string, any> = {};
  private ceaseDateDay?: string;
  private ceaseDateMonth?: string;
  private ceaseDateYear?: string;
  private dateEffectiveFromDay?: string;
  private dateEffectiveFromMonth?: string;
  private dateEffectiveFromYear?: string;

  private registrationDate?: string;

  private journeyTypes: JourneyTypes = {} as JourneyTypes;

  private dateEffectiveFromErrorMessages: Record<string, string> = {};
  private errorMessages: Record<string, any> = {};
  private ceaseDateErrorMessages: Record<string, string> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;
    this.ceaseDateDay = data[`${CEASE_DATE_FIELD}-day`];
    this.ceaseDateMonth = data[`${CEASE_DATE_FIELD}-month`];
    this.ceaseDateYear = data[`${CEASE_DATE_FIELD}-year`];

    this.dateEffectiveFromDay = data[`${DATE_EFFECTIVE_FROM_FIELD}-day`];
    this.dateEffectiveFromMonth = data[`${DATE_EFFECTIVE_FROM_FIELD}-month`];
    this.dateEffectiveFromYear = data[`${DATE_EFFECTIVE_FROM_FIELD}-year`];

    this.registrationDate = data.registration_date;

    this.journeyTypes = data.journeyTypes;

    this.ceaseDateErrorMessages = i18n?.errorMessages?.ceaseDate ?? {};
    this.dateEffectiveFromErrorMessages = i18n?.errorMessages?.dateEffectiveFrom ?? {};
    return this;
  }

  runValidation(): UIErrors {
    const uiErrors = new UIErrors();
    if (isCeaseDatePage(this.data.pageType)) {
      validateDate(
        {
          day: this.ceaseDateDay,
          month: this.ceaseDateMonth,
          year: this.ceaseDateYear
        },
        uiErrors,
        CEASE_DATE_FIELD,
        this.ceaseDateErrorMessages
      );
      return uiErrors;
    }
    if (isAddPartnerPage(this.data.pageType) && this.journeyTypes.isPostTransition) {
      validateDate(
        {
          day: this.dateEffectiveFromDay,
          month: this.dateEffectiveFromMonth,
          year: this.dateEffectiveFromYear
        },
        uiErrors,
        DATE_EFFECTIVE_FROM_FIELD,
        this.dateEffectiveFromErrorMessages,
        this.registrationDate
      );
      return uiErrors;
    }
    return uiErrors;
  }
}

export default PartnerLegalEntityValidator;
