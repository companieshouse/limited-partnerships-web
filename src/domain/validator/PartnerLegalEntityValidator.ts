import { isCeaseDatePage } from "../../presentation/controller/postTransition/pageType";
import UIErrors from "../entities/UIErrors";
import { validateDate } from "./DateValidators";

class PartnerLegalEntityValidator {
  private data: Record<string, any> = {};
  private ceaseDateDay?: string;
  private ceaseDateMonth?: string;
  private ceaseDateYear?: string;

  private errorMessages: Record<string, any> = {};
  private ceaseDateErrorMessages: Record<string, string> = {};

  set(data: Record<string, any>, i18n: any): this {
    this.data = data;
    this.ceaseDateDay = data["cease_date-day"];
    this.ceaseDateMonth = data["cease_date-month"];
    this.ceaseDateYear = data["cease_date-year"];

    this.ceaseDateErrorMessages = i18n?.errorMessages?.ceaseDate ?? {};
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
        "cease_date",
        this.ceaseDateErrorMessages
      );
      return uiErrors;
    }
    return uiErrors;
  }
}

export default PartnerLegalEntityValidator;
