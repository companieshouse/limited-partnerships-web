/* eslint-disable */

import crypto from "crypto";
import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import ILimitedPartnershipGateway from "../../../domain/ILimitedPartnershipGateway";
import TransactionLimitedPartnership from "../../../domain/entities/TransactionLimitedPartnership";
import LimitedPartnershipGatewayBuilder from "./LimitedPartnershipGatewayBuilder";
import UIErrors, { ApiErrors } from "../../../domain/entities/UIErrors";
import PageType from "../../../presentation/controller/PageType";

class LimitedPartnershipInMemoryGateway implements ILimitedPartnershipGateway {
  submissionId = crypto.randomUUID().toString();
  error = false;

  limitedPartnerships: TransactionLimitedPartnership[] = [];
  uiErrors: UIErrors = new UIErrors();

  feedLimitedPartnerships(limitedPartnerships: TransactionLimitedPartnership[]) {
    this.limitedPartnerships = limitedPartnerships;
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

  async createSubmission(
    opt: { access_token: string },
    pageType: PageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    const apiErrors: ApiErrors = {
      errors: {}
    };

    if (!data.partnership_name) {
      apiErrors.errors = {
        ...apiErrors.errors,
        "data.partnershipName": "partnership_name must be less than 160"
      };
    }

    if (Object.keys(apiErrors.errors).length > 0) {
      this.uiErrors.formatValidationErrorToUiErrors(apiErrors);
    }

    if (this.uiErrors?.hasErrors()) {
      throw this.uiErrors;
    }

    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder();

    limitedPartnershipBuilder.withData(pageType, data);

    this.limitedPartnerships.push(limitedPartnershipBuilder.build());

    return this.submissionId;
  }

  async sendPageData(
    opt: { access_token: string },
    transactionId: string,
    submissionId: string,
    registrationPageType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<void> {
    if (this.uiErrors?.hasErrors()) {
      throw this.uiErrors;
    }

    let index = this.limitedPartnerships.findIndex((lp) => lp._id === submissionId);

    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder({
      _id: submissionId,
      data: this.limitedPartnerships[index]?.data
    });

    limitedPartnershipBuilder.withData(registrationPageType, data);

    this.limitedPartnerships[index] = limitedPartnershipBuilder.build();
  }

  async getLimitedPartnership(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string
  ): Promise<LimitedPartnership> {
    if (this.error) {
      throw new Error(`Not found: ${submissionId}`);
    }

    return new LimitedPartnershipGatewayBuilder(this.limitedPartnerships[0]).build();
  }
}

export default LimitedPartnershipInMemoryGateway;
