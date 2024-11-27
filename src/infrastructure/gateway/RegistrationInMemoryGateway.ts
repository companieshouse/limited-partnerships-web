/* eslint-disable */

import crypto from "crypto";
import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import CustomError from "../../domain/entities/CustomError";
import TransactionLimitedPartnership from "../../domain/entities/TransactionLimitedPartnership";
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
    access_token: string,
    registrationPageType: RegistrationPageType
  ): Promise<string> {
    if (registrationPageType !== RegistrationPageType.name) {
      throw new Error("wrong type");
    }

    return this.transactionId;
  }

  async createSubmission(
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

    const limitedPartnership = this.buildLimitedPartnership(
      registrationPageType,
      data
    );

    this.limitedPartnerships.push(limitedPartnership);

    if (transactionId === this.transactionId) {
      this.limitedPartnerships[0] = limitedPartnership;
    }

    return this.submissionId;
  }

  private buildLimitedPartnership(
    pageType: RegistrationPageType,
    data: Record<string, any>
  ): TransactionLimitedPartnership {
    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder({
      _id: this.submissionId,
    });

    limitedPartnershipBuilder.withData(pageType, data);

    return limitedPartnershipBuilder.build();
  }

  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    const limitedPartnerShip = this.limitedPartnerships.find(
      (lp) => lp._id === id
    );

    if (!limitedPartnerShip) {
      throw new CustomError("Limited partnership", `Not found: ${id}`);
    }

    return new LimitedPartnershipGatewayBuilder(limitedPartnerShip).build();
  }
}

export default RegistrationInMemoryGateway;
