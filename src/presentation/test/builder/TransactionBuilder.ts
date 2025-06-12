import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { TransactionStatus } from "../../../domain/entities/TransactionTypes";

class TransactionBuilder {
  private readonly transaction: Transaction = {
    id: "test-id",
    reference: "test-ref",
    status: TransactionStatus.open,
    filingMode: "limited-partnership-registration",
    description: "test-description"
  };

  withId(id: string) {
    this.transaction.id = id;
    return this;
  }

  withStatus(status: string) {
    this.transaction.status = status;
    return this;
  }

  withFilingMode(filingMode: string) {
    this.transaction.filingMode = filingMode;
    return this;
  }

  build(): Transaction {
    return { ...this.transaction };
  }
}

export default TransactionBuilder;
