/* eslint-disable */

import crypto from "crypto";
import {
  LimitedPartnership,
  NameEndingType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import ILimitedPartnershipGateway from "../../../domain/ILimitedPartnershipGateway";
import CustomError from "../../../domain/entities/CustomError";
import TransactionLimitedPartnership from "../../../domain/entities/TransactionLimitedPartnership";
import LimitedPartnershipGatewayBuilder from "./LimitedPartnershipGatewayBuilder";
import UIErrors, { ApiErrors } from "../../../domain/entities/UIErrors";

class RegistrationInMemoryGateway implements ILimitedPartnershipGateway {
  submissionId = crypto.randomUUID().toString();

  limitedPartnerships: TransactionLimitedPartnership[] = [];
  uiErrors: UIErrors = new UIErrors();

  feedLimitedPartnerships(
    limitedPartnerships: TransactionLimitedPartnership[]
  ) {
    this.limitedPartnerships = limitedPartnerships;
  }

  feedErrors(errors?: ApiErrors) {
    this.uiErrors.errors.errorList = [];

    if (!errors) {
      return;
    }

    this.uiErrors.formatValidationErrorToUiErrors(errors);
  }

  async createSubmission(
    opt: { access_token: string },
    registrationPageType: RegistrationPageType,
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

    if (!data.name_ending) {
      apiErrors.errors = {
        ...apiErrors.errors,
        "data.nameEnding": `name_ending must be one of ${Object.values(
          NameEndingType
        ).join(", ")}`
      };
    }

    if (Object.keys(apiErrors.errors).length > 0) {
      this.uiErrors.formatValidationErrorToUiErrors(apiErrors);
    }

    if (this.uiErrors.errors.errorList.length > 0) {
      throw this.uiErrors;
    }

    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder();

    limitedPartnershipBuilder.withData(registrationPageType, data);

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
    const apiErrors: ApiErrors = {
      errors: {}
    };

    if (!data.email) {
      apiErrors.errors = {
        ...apiErrors.errors,
        "data.email": "must be a well-formed email address"
      };
    }

    if (Object.keys(apiErrors.errors).length > 0) {
      this.uiErrors.formatValidationErrorToUiErrors(apiErrors);
    }

    if (this.uiErrors.errors.errorList.length > 0) {
      throw this.uiErrors;
    }

    let index = this.limitedPartnerships.findIndex(
      (lp) => lp._id === submissionId
    );

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
    if (
      transactionId === ":transactionId" &&
      submissionId === ":submissionId"
    ) {
      return new LimitedPartnershipGatewayBuilder(
        this.limitedPartnerships[0]
      ).build();
    }

    const limitedPartnerShip = this.limitedPartnerships.find(
      (lp) => lp._id === submissionId
    );

    if (!limitedPartnerShip) {
      throw new CustomError(
        "Limited partnership",
        `Not found: ${submissionId}`
      );
    }

    return new LimitedPartnershipGatewayBuilder(limitedPartnerShip).build();
  }
}

export default RegistrationInMemoryGateway;
