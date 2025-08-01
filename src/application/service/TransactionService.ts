import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import ITransactionGateway from "../../domain/ITransactionGateway";
import { logger } from "../../utils";
import { extractAPIErrors } from "./utils";
import UIErrors from "../../domain/entities/UIErrors";
import { Tokens } from "../../domain/types";
import { IncorporationKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

class TransactionService {
  constructor(private readonly transactionGateway: ITransactionGateway) {}

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

  async createTransaction(
    opt: Tokens,
    incorporationKind: IncorporationKind,
    description?: string
  ): Promise<{
    transactionId: string;
    errors?: UIErrors;
  }> {
    try {
      const transactionId = await this.transactionGateway.createTransaction(opt, incorporationKind, description);

      return { transactionId };
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error creating transaction: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        transactionId: "",
        errors
      };
    }
  }
}

export default TransactionService;
