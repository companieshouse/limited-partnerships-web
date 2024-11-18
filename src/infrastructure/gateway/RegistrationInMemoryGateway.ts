/* eslint-disable */

import crypto from "crypto";
import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionRegistrationType from "../../application/registration/TransactionRegistrationType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import CustomError from "../../domain/entities/CustomError";
import TransactionLimitedPartnership from "../../domain/entities/TransactionLimitedPartnership";
import LimitedPartnershipBuilder from "./LimitedPartnershipBuilder";

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

  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    const limitedPartnerShip = this.limitedPartnerships.find(
      (lp) => lp._id === id
    );

    if (!limitedPartnerShip) {
      throw new CustomError("Limited partnership", `Not found: ${id}`);
    }

    return new LimitedPartnershipBuilder(limitedPartnerShip).build();
  }

  async createTransaction(
    transactionType: TransactionRegistrationType
  ): Promise<string> {
    if (transactionType === TransactionRegistrationType.START) {
      return this.transactionId;
    }

    return "";
  }

  async createSubmissionFromTransaction(
    transactionType: TransactionRegistrationType,
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
      transactionType,
      data,
      transactionId
    );

    this.limitedPartnerships.push(limitedPartnership);

    if (transactionId === this.transactionId) {
      this.limitedPartnerships[0] = limitedPartnership;
    }

    return this.submissionId;
  }

  private buildLimitedPartnership(
    transactionType: TransactionRegistrationType,
    data: Record<string, any>,
    transactionId: string
  ): TransactionLimitedPartnership {
    const limitedPartnershipBuilder = new LimitedPartnershipBuilder({
      _id: this.submissionId,
      links: [
        {
          self: `/limited-partnership/transaction/${transactionId}/submission/${this.submissionId}/name`,
        },
      ],
    });

    limitedPartnershipBuilder.withData(transactionType, data);
    const limitedPartnership = limitedPartnershipBuilder.build();

    return limitedPartnership;
  }
}

export default RegistrationInMemoryGateway;
