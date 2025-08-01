/* eslint-disable */

import crypto from "crypto";

import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { IncorporationKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import PageType from "../../../presentation/controller/PageType";
import ITransactionGateway from "../../../domain/ITransactionGateway";
import TransitionPageType from "../../../presentation/controller/transition/PageType";
import { SERVICE_NAME_REGISTRATION, SERVICE_NAME_TRANSITION } from "../../../config/constants";
import TransactionBuilder from "../../../presentation/test/builder/TransactionBuilder";
import { Tokens } from "../../../domain/types";

class TransactionInMemoryGateway implements ITransactionGateway {
  transactionId = crypto.randomUUID().toString();
  error = false;

  transactions: Transaction[] = [];

  setError(value: boolean) {
    this.error = value;
  }

  feedTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  async createTransaction(opt: Tokens, incorporationKind: IncorporationKind, description?: string): Promise<string> {
    let transactionDecription = SERVICE_NAME_REGISTRATION;

    if (incorporationKind === IncorporationKind.TRANSITION) {
      transactionDecription = SERVICE_NAME_TRANSITION;
    } else if (description) {
      transactionDecription = description;
    }

    const transaction = new TransactionBuilder()
      .withId(this.transactionId)
      .withDescription(transactionDecription)
      .build();

    this.transactions.push(transaction);

    return this.transactionId;
  }

  async closeTransaction(opt: Tokens, transactionId: string): Promise<ApiResponse<Transaction>> {
    return {
      resource: {
        id: transactionId,
        status: "closed"
      } as Transaction,
      httpStatusCode: 204,
      headers: { "x-payment-required": "/abc" }
    };
  }

  async getTransaction(opt: { access_token: string }, transactionId: string): Promise<Transaction> {
    if (this.error) {
      throw new Error(`Not found: ${transactionId}`);
    }

    return this.transactions[0];
  }
}

export default TransactionInMemoryGateway;
