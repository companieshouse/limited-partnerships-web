/* eslint-disable */

import crypto from "crypto";

import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import IGeneralPartnerGateway from "../../../domain/IGeneralPartnerGateway";
import UIErrors, { ApiErrors } from "../../../domain/entities/UIErrors";
import TransactionGeneralPartner from "../../../domain/entities/TransactionGeneralPartner";

class GeneralPartnerInMemoryGateway implements IGeneralPartnerGateway {
  generalPartnerId = crypto.randomUUID().toString();
  error = false;

  generalPartners: TransactionGeneralPartner[] = [];
  uiErrors: UIErrors = new UIErrors();

  feedGeneralPartners(generalPartners: TransactionGeneralPartner[]) {
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

  async getGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string
  ): Promise<GeneralPartner> {
    if (this.error) {
      throw new Error(`Not found: ${generalPartnerId}`);
    }

    return this.generalPartners[0];
  }

  async getGeneralPartners(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<GeneralPartner[]> {
    return this.generalPartners;
  }

  async sendPageData(
    opt: { access_token: string },
    transactionId: string,
    generalPartnerId: string,
    data: Record<string, any>
  ): Promise<void> {
    if (this.uiErrors.errors.errorList.length > 0) {
      throw this.uiErrors;
    }

    let index = this.generalPartners.findIndex((gp) => gp._id === generalPartnerId);

    if (index === -1) {
      throw new Error(`Not found: ${generalPartnerId}`);
    }

    this.generalPartners[index].data = data;
  }

  async deleteGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string
  ): Promise<void> {
    if (this.uiErrors.errors.errorList.length > 0) {
      throw this.uiErrors;
    }

    let index = this.generalPartners.findIndex((gp) => gp._id === generalPartnerId);

    if (index === -1) {
      throw new Error(`Not found: ${generalPartnerId}`);
    }

    this.generalPartners = this.generalPartners.filter((gp) => gp._id !== generalPartnerId);
  }
}

export default GeneralPartnerInMemoryGateway;
