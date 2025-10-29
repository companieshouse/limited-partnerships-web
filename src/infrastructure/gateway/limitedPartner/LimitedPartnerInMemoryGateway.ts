/* eslint-disable */

import crypto from "crypto";

import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import ILimitedPartnerGateway from "../../../domain/ILimitedPartnerGateway";
import UIErrors, { ApiErrors } from "../../../domain/entities/UIErrors";
import TransactionLimitedPartner from "../../../domain/entities/TransactionLimitedPartner";
import { resetFormerNamesIfPreviousNameIsFalse, validateAndFormatPartnerCeaseDate, validateAndFormatPartnerDateEffectiveFrom, validateAndFormatPartnerPersonDateOfBirth } from "../utils";

class LimitedPartnerInMemoryGateway implements ILimitedPartnerGateway {
  limitedPartnerId = crypto.randomUUID().toString();
  error = false;

  limitedPartners: TransactionLimitedPartner[] = [];
  uiErrors: UIErrors = new UIErrors();

  feedLimitedPartners(limitedPartners: TransactionLimitedPartner[]) {
    this.limitedPartners = limitedPartners;
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

  async createLimitedPartner(
    opt: { access_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    if (this.uiErrors?.hasErrors()) {
      throw this.uiErrors;
    }

    validateAndFormatPartnerPersonDateOfBirth(data);
    validateAndFormatPartnerDateEffectiveFrom(data);
    resetFormerNamesIfPreviousNameIsFalse(data);
    validateAndFormatPartnerCeaseDate(data);
    

    this.limitedPartners.push({
      data
    });

    return this.limitedPartnerId;
  }

  async getLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string
  ): Promise<LimitedPartner> {
    if (this.error) {
      throw new Error(`Not found: ${limitedPartnerId}`);
    }

    return this.limitedPartners[0];
  }

  async getLimitedPartners(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<LimitedPartner[]> {
    return this.limitedPartners;
  }

  async sendPageData(
    opt: { access_token: string },
    transactionId: string,
    limitedPartnerId: string,
    data: Record<string, any>
  ): Promise<void> {
    if (this.uiErrors?.hasErrors()) {
      throw this.uiErrors;
    }

    let index = this.limitedPartners.findIndex((lp) => lp._id === limitedPartnerId);

    if (index === -1) {
      throw new Error(`Not found: ${limitedPartnerId}`);
    }

    validateAndFormatPartnerPersonDateOfBirth(data);
    validateAndFormatPartnerDateEffectiveFrom(data);
    resetFormerNamesIfPreviousNameIsFalse(data);
    validateAndFormatPartnerCeaseDate(data);

    this.limitedPartners[index].data = { ...this.limitedPartners[index].data, ...data };
  }

  async deleteLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string
  ): Promise<void> {
    if (this.uiErrors?.hasErrors()) {
      throw this.uiErrors;
    }

    let index = this.limitedPartners.findIndex((lp) => lp._id === limitedPartnerId);

    if (index === -1) {
      throw new Error(`Not found: ${limitedPartnerId}`);
    }

    this.limitedPartners = this.limitedPartners.filter((lp) => lp._id !== limitedPartnerId);
  }
}

export default LimitedPartnerInMemoryGateway;
