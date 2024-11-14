/* eslint-disable */

import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionRegistrationType from "../../application/registration/TransactionRegistrationType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import CustomError from "domain/entities/CustomError";

type TransactionLimitedPartnership = LimitedPartnership & {
  _id?: string;
  links?: { self: string }[];
};

class RegistrationInMemoryGateway implements IRegistrationGateway {
  transactionId = "transaction-id";
  submissionId = "submission-id";

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

  async get(id: string): Promise<LimitedPartnership> {
    throw new Error("Method not implemented.");
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
    if (this.errors.length > 0) {
      throw this.errors;
    }

    const limitedPartnership = {
      _id: transactionId,
      data: {
        partnership_name: data.partnership_name,
        name_ending: data.name_ending,
      },
      links: [
        {
          self: `/limited-partnership/transaction/${this.transactionId}/submission/${this.submissionId}/name`,
        },
      ],
    };

    this.limitedPartnerships.push(limitedPartnership);

    return this.submissionId;
  }
}

export default RegistrationInMemoryGateway;
