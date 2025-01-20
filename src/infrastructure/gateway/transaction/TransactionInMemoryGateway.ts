/* eslint-disable */

import crypto from "crypto";

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
      throw new Error("wrong type");
    }

    return this.transactionId;
  }
}

export default TransactionInMemoryGateway;
