/* eslint-disable */

import crypto from "crypto";

import IGeneralPartnerGateway from "../../../domain/IGeneralPartnerGateway";
import GeneralPartner from "../../../domain/entities/GeneralPartner";
import UIErrors, { ApiErrors } from "../../../domain/entities/UIErrors";

class GeneralPartnerInMemoryGateway implements IGeneralPartnerGateway {
  generalPartnerId = crypto.randomUUID().toString();
  error = false;

  generalPartners: GeneralPartner[] = [];
  uiErrors: UIErrors = new UIErrors();

  feedGeneralPartners(
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
    if (this.uiErrors.errors.errorList.length > 0) {
      throw this.uiErrors;
    }

    this.generalPartners.push({
      data
    });

    return this.generalPartnerId;
  }
}

export default GeneralPartnerInMemoryGateway;
