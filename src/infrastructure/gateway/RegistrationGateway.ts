/* eslint-disable */

import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionRegistrationType from "application/registration/TransactionRegistrationType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";

class RegistrationGateway implements IRegistrationGateway {
  async get(id: string): Promise<LimitedPartnership> {
    throw new Error("Method not implemented.");
  }

  async createTransaction(
    transactionType: TransactionRegistrationType
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async createSubmissionFromTransaction(
    transactionType: TransactionRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export default RegistrationGateway;
