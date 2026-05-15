import { PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import UIErrors from "../entities/UIErrors";
import IndividualPscValidator from "./IndividualPscValidator";
import OtherRegistrablePscValidator from "./OtherRegistrablePscValidator";

type PscFormData = {
  type?: string;
  [key: string]: any;
};

export default class PersonWithSignificantControlValidator {
  private delegate: any;

  set(data: PscFormData, i18n: any): this {
    if (data.type === PersonWithSignificantControlType.INDIVIDUAL_PERSON) {
      this.delegate = new IndividualPscValidator().set(data, i18n);
    } else if (data.type === PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON) {
      this.delegate = new OtherRegistrablePscValidator().set(data, i18n);
    } else {
      this.delegate = null;
    }
    return this;
  }

  runValidation(): UIErrors {
    if (this.delegate && typeof this.delegate.runValidation === "function") {
      return this.delegate.runValidation();
    }
    return new UIErrors();
  }
};
