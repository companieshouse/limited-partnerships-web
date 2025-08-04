/* eslint-disable */

import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ApiResponse, ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { IncorporationKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import { makeApiCallWithRetry } from "../api";
import ITransactionGateway from "../../../domain/ITransactionGateway";
import PageType from "../../../presentation/controller/PageType";
import { SDK_TRANSACTION_SERVICE, SERVICE_NAME_REGISTRATION, SERVICE_NAME_TRANSITION } from "../../../config/constants";

class TransactionGateway implements ITransactionGateway {
  async createTransaction(
    opt: { access_token: string; refresh_token: string },
    incorporationKind: IncorporationKind,
    description?: string,
    company?: {
      companyName: string;
      companyNumber: string;
    }
  ): Promise<string> {
    let transactionDecription = SERVICE_NAME_REGISTRATION;

    if (incorporationKind === IncorporationKind.TRANSITION) {
      transactionDecription = SERVICE_NAME_TRANSITION;
    } else if (description) {
      transactionDecription = description;
    }

    let data: {
      reference: string;
      description: string;
      companyName?: string;
      companyNumber?: string;
    } = {
      reference: "LimitedPartnershipsReference",
      description: transactionDecription
    };

    if (company) {
      data = {
        ...data,
        companyName: company.companyName,
        companyNumber: company.companyNumber
      };
    }

    const apiCall = {
      service: SDK_TRANSACTION_SERVICE,
      method: "postTransaction",
      args: [data]
    };

    const response = await makeApiCallWithRetry<Resource<Transaction> | ApiErrorResponse>(opt, apiCall);

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

    const response = await makeApiCallWithRetry<ApiResponse<Transaction> | ApiErrorResponse>(opt, apiCall);

    if (response.httpStatusCode !== 204 && response.httpStatusCode !== 202) {
      throw response;
    }

    return response as ApiResponse<Transaction>;
  }

  async getTransaction(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<Transaction> {
    const apiCall = {
      service: SDK_TRANSACTION_SERVICE,
      method: "getTransaction",
      args: [transactionId]
    };

    const response = await makeApiCallWithRetry<ApiResponse<Transaction> | ApiErrorResponse>(opt, apiCall);

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return (response as ApiResponse<Transaction>)?.resource ?? ({} as Transaction);
  }
}

export default TransactionGateway;
