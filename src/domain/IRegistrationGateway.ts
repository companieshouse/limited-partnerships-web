import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionRegistrationType from "../application/registration/TransactionRegistrationType";

interface IRegistrationGateway {
  get(id: string): Promise<LimitedPartnership>;
  create(
    transactionType: TransactionRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string>;
  update(
    transactionType: TransactionRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<void>;
}

export default IRegistrationGateway;
