/* eslint-disable */

import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ApiResponse, ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

import { makeApiCallWithRetry } from "../api";
import ITransactionGateway from "../../../domain/ITransactionGateway";
import PageType from "../../../presentation/controller/PageType";
import { SDK_TRANSACTION_SERVICE } from "../../../config/constants";

class TransactionGateway implements ITransactionGateway {
  async createTransaction(
    opt: { access_token: string; refresh_token: string },
    pageType: PageType
  ): Promise<string> {
    const apiCall = {
      service: SDK_TRANSACTION_SERVICE,
      method: "postTransaction",
      args: [
        {
          reference: "LimitedPartnershipsReference",
          description: "Register a limited partnership"
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

  async closeTransaction(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<ApiResponse<Transaction>> {
    const apiCall = {
      service: SDK_TRANSACTION_SERVICE,
      method: "putTransaction",
      args: [
        {
          id: transactionId,
          status: "closed"
        }
      ]
    };

    const response = await makeApiCallWithRetry<
      ApiResponse<Transaction> | ApiErrorResponse
    >(opt, apiCall);

    if (response.httpStatusCode !== 204 && response.httpStatusCode !== 202) {
      throw response;
    }

    return (response as ApiResponse<Transaction>);
  }

   async getTransaction(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<Transaction> {
    const apiCall = {
      service: SDK_TRANSACTION_SERVICE,
      method: "getTransaction",
      args: [
        transactionId
      ]
    };

    const response = await makeApiCallWithRetry<
      ApiResponse<Transaction> | ApiErrorResponse
    >(opt, apiCall);

    console.log(JSON.stringify(response, null, 2));
    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return (response as ApiResponse<Transaction>)?.resource ?? {} as Transaction;
  }
}

export default TransactionGateway;
