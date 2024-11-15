/* eslint-disable */

import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionRegistrationType from "../../application/registration/TransactionRegistrationType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import CustomError from "../../domain/entities/CustomError";

type TransactionLimitedPartnership = LimitedPartnership & {
  _id?: string;
  links?: { self: string }[];
};

class RegistrationInMemoryGateway implements IRegistrationGateway {
  transactionId = "92793162-6334-4112-99e2-f96a3d7ef2ae";
  submissionId = "04aae9fa-c444-479f-acd2-5580e9a5d9bb";

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

    return limitedPartnerShip;
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

    const limitedPartnership = {
      _id: this.submissionId,
      data: {
        partnership_name: data.partnership_name,
        name_ending: data.name_ending,
      },
      links: [
        {
          self: `/limited-partnership/transaction/${transactionId}/submission/${this.submissionId}/name`,
        },
      ],
    };

    this.limitedPartnerships.push(limitedPartnership);

    if (transactionId === this.transactionId) {
      this.limitedPartnerships[0] = limitedPartnership;
    }

    return this.submissionId;
  }
}

export default RegistrationInMemoryGateway;
