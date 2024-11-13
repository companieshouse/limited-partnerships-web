import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionRegistrationType from "application/registration/TransactionRegistrationType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import CustomError from "domain/entities/CustomError";

type TransactionLimitedPartnership = LimitedPartnership & {
  _id?: string;
  links?: { self: string }[];
};

class RegistrationInMemoryGateway implements IRegistrationGateway {
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

  async create(
    transactionType: TransactionRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    const id = "submission-id";

    const limitedPartnership = {
      _id: transactionId,
      data,
      links: [{ self: "/limited-partnership/" }],
    };

    this.limitedPartnerships.push(limitedPartnership);

    return id;
  }

  async update(
    transactionType: TransactionRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default RegistrationInMemoryGateway;
