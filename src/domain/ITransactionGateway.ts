import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { IncorporationKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

interface ITransactionGateway {
  createTransaction(
    opt: { access_token: string },
    incorporationKind: IncorporationKind,
    description?: string,
    company?: {
      companyName: string;
      companyNumber: string;
    }
  ): Promise<string>;
  closeTransaction(opt: { access_token: string }, transactionId: string): Promise<ApiResponse<Transaction>>;
  getTransaction(opt: { access_token: string }, transactionId: string): Promise<Transaction>;
}

export default ITransactionGateway;
