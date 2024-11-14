import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionRegistrationType from "../application/registration/TransactionRegistrationType";

interface IRegistrationGateway {
  getSubmissionById(id: string): Promise<LimitedPartnership>;
  createTransaction(
    transactionType: TransactionRegistrationType
  ): Promise<string>;
  createSubmissionFromTransaction(
    transactionType: TransactionRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
}

export default IRegistrationGateway;
