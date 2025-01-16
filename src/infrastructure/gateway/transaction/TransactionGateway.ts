/* eslint-disable */

import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

import { makeApiCallWithRetry } from "../api";
import ITransactionGateway from "../../../domain/ITransactionGateway";
import PageType from "../../../presentation/controller/PageType";

class TransactionGateway implements ITransactionGateway {
  async createTransaction(
    opt: { access_token: string; refresh_token: string },
    pageType: PageType
  ): Promise<string> {
    const apiCall = {
      service: "transaction",
      method: "postTransaction",
      args: [
        {
          reference: "LimitedPartnershipsReference",
          description: "Limited Partnerships Transaction"
        }
      ]
    };

    const response = await makeApiCallWithRetry<
      Resource<Transaction> | ApiErrorResponse
    >(opt, apiCall);

    if (response.httpStatusCode !== 201) {
      throw response;
    }

    return (response as Resource<Transaction>)?.resource?.id ?? "";
  }
}

export default TransactionGateway;
