import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { TransactionStatus } from "../../../domain/entities/TransactionTypes";
import { SERVICE_NAME_REGISTRATION } from "../../../config/constants";

class TransactionBuilder {
  private readonly transaction: Transaction = {
    id: "test-id",
    reference: "test-ref",
    status: TransactionStatus.open,
    filingMode: "limited-partnership-registration",
    description: SERVICE_NAME_REGISTRATION,
    companyName: "",
    companyNumber: ""
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

  withDescription(description: string) {
    this.transaction.description = description;
    return this;
  }

  withCompanyName(companyName: string) {
    this.transaction.companyName = companyName;
    return this;
  }

  withCompanyNumber(companyNumber: string) {
    this.transaction.companyNumber = companyNumber;
    return this;
  }

  withKind(kind: string) {
    this.transaction.resources = {
      "limited-partnership/partnership": {
        kind: kind,
        links: {
          resource: "",
        }
      }
    };
    return this;
  }

  withResources(resources: Record<string, { kind: string; links: { resource: string } }>) {
    this.transaction.resources = resources;
    return this;
  }

  build(): Transaction {
    return { ...this.transaction };
  }
}

export default TransactionBuilder;
