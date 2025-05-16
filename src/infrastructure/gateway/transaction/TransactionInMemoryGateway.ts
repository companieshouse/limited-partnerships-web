/* eslint-disable */

import crypto from "crypto";

import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import PageType from "../../../presentation/controller/PageType";
import ITransactionGateway from "../../../domain/ITransactionGateway";

class TransactionInMemoryGateway implements ITransactionGateway {
  transactionId = crypto.randomUUID().toString();

  async createTransaction(
    opt: { access_token: string },
    pageType: PageType
  ): Promise<string> {
    if (pageType !== RegistrationPageType.name) {
      throw new Error("Wrong page type to create a new transaction");
    }

    return this.transactionId;
  }

  async closeTransaction(
    opt: { access_token: string },
    transactionId: string
  ): Promise<ApiResponse<Transaction>> {
    return {
      resource: {
        id: transactionId,
        status: "closed"
      } as Transaction,
      httpStatusCode: 204,
      headers:{"x-payment-required":"/abc"},
    };
  }
}

export default TransactionInMemoryGateway;
