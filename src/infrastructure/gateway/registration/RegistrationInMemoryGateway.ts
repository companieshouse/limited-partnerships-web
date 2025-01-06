/* eslint-disable */

import crypto from "crypto";
import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import CustomError from "../../../domain/entities/CustomError";
import TransactionLimitedPartnership from "../../../domain/entities/TransactionLimitedPartnership";
import LimitedPartnershipGatewayBuilder from "./LimitedPartnershipGatewayBuilder";

class RegistrationInMemoryGateway implements IRegistrationGateway {
  transactionId = crypto.randomUUID().toString();
  submissionId = crypto.randomUUID().toString();

  limitedPartnerships: TransactionLimitedPartnership[] = [];
  errors: CustomError[] = [];

  feedLimitedPartnerships(
    limitedPartnerships: TransactionLimitedPartnership[]
  ) {
    this.limitedPartnerships = limitedPartnerships;
  }

  feedErrors(errors: CustomError[]) {
    this.errors = errors;
  }

  async createTransaction(
    opt: { access_token: string },
    registrationPageType: RegistrationPageType
  ): Promise<string> {
    if (registrationPageType !== RegistrationPageType.name) {
      throw new Error("wrong type");
    }

    return this.transactionId;
  }

  async createSubmission(
    opt: { access_token: string },
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    if (!data.partnership_name) {
      this.errors.push(
        new CustomError(
          "partnership_name",
          "partnership_name must be at least 3 characters"
        )
      );
    }

    if (!data.name_ending) {
      this.errors.push(
        new CustomError(
          "name_ending",
          `name_ending must be one of ${Object.keys(NameEndingType).join(", ")}`
        )
      );
    }

    if (this.errors.length > 0) {
      throw this.errors;
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
    data: LimitedPartnership["data"]
  ): Promise<void> {
    if (!data || !Object.keys(data).length) {
      throw new Error("data is empty - No data has been sent from the page");
    }

    let index = this.limitedPartnerships.findIndex(
      (lp) => lp._id === submissionId
    );

    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder({
      _id: submissionId,
      data: this.limitedPartnerships[index]?.data,
    });

    limitedPartnershipBuilder.withLpData(data);

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
