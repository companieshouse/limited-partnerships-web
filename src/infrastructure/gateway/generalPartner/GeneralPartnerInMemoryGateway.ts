/* eslint-disable */

import crypto from "crypto";

import IGeneralPartnerGateway from "../../../domain/IGeneralPartnerGateway";
import GeneralPartner from "../../../domain/entities/GeneralPartner";
import UIErrors, { ApiErrors } from "../../../domain/entities/UIErrors";

class GeneralPartnerInMemoryGateway implements IGeneralPartnerGateway {
  submissionId = crypto.randomUUID().toString();
  error = false;

  generalPartners: GeneralPartner[] = [];
  uiErrors: UIErrors = new UIErrors();

  feedLimitedPartnerships(
    generalPartners: GeneralPartner[]
  ) {
    this.generalPartners = generalPartners;
  }

  feedErrors(errors?: ApiErrors) {
    this.uiErrors.errors.errorList = [];

    if (!errors) {
      return;
    }

    this.uiErrors.formatValidationErrorToUiErrors(errors);
  }

  setError(value: boolean) {
    this.error = value;
  }

  async createGeneralPartner(
    opt: { access_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    const apiErrors: ApiErrors = {
      errors: {}
    };

    if (!data.first_name) {
      apiErrors.errors = {
        ...apiErrors.errors,
        "data.firstName": "first_name must be less than 160 characters"
      };
    }

    if (!data.last_name) {
      apiErrors.errors = {
        ...apiErrors.errors,
        "data.lastName": "last_name must be less than 160 characters"
      };
    }

    if (Object.keys(apiErrors.errors).length > 0) {
      this.uiErrors.formatValidationErrorToUiErrors(apiErrors);
    }

    if (this.uiErrors.errors.errorList.length > 0) {
      throw this.uiErrors;
    }

    // delete data["_csrf"];  // TODO double-check not needed. Is done for Limited Partnership 
    this.generalPartners.push({
      _id: this["_id"],
      first_name: data.first_name,
      last_name: data.last_name,
      previous_name: data.previous_name,
      dob_day: data.dob_day,
      dob_month: data.dob_month,
      dob_year: data.dob_year,
      nationality: data.nationality,
      disqualification_statement: data.disqualification_statement
    });

    return this.submissionId;
  }
}

export default GeneralPartnerInMemoryGateway;
