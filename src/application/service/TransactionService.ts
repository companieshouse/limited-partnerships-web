import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import ITransactionGateway from "../../domain/ITransactionGateway";
import { logger } from "../../utils";
import { extractAPIErrors } from "./utils";

class TransactionService {
  constructor(
    private readonly transactionGateway: ITransactionGateway,
  ) {}

  async getTransaction(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<Transaction> {
    try {
      return await this.transactionGateway.getTransaction(opt, transactionId);
    } catch (errors: any) {
      const { apiErrors } = extractAPIErrors(errors);

      logger.error(`Error getting transaction: ${JSON.stringify(apiErrors)}`);

      throw errors;
    }
  }

}

export default TransactionService;

