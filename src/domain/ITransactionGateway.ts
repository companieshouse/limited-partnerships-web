import PageType from "../presentation/controller/PageType";

import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

interface ITransactionGateway {
  createTransaction(
    opt: { access_token: string },
    pageType: PageType
  ): Promise<string>;

  closeTransaction(
    opt: { access_token: string },
    transactionId: string
  ): Promise<ApiResponse<Transaction>>;

  getTransaction(
    opt: { access_token: string },
    transactionId: string
  ): Promise<Transaction>;
}

export default ITransactionGateway;
