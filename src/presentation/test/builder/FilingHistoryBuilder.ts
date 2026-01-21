import { FilingHistoryItem } from "@companieshouse/api-sdk-node/dist/services/company-filing-history/types";

class FilingHistoryBuilder {
  private transactionId = "NGA0NDcwMzcyMWFkaXF6a2N4";
  private barcode = "8G3ZMW4B";
  private type = "LPTS01";
  private date = "2025-08-06";
  private category = "incorporation";
  private description = "transition-of-limited-partnership";

  withTransactionId(transactionId: string): this {
    this.transactionId = transactionId;
    return this;
  }

  withBarcode(barcode: string): this {
    this.barcode = barcode;
    return this;
  }

  withType(type: string): this {
    this.type = type;
    return this;
  }

  withDate(date: string): this {
    this.date = date;
    return this;
  }

  withCategory(category: string): this {
    this.category = category;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  build(): FilingHistoryItem {
    return {
      transactionId: this.transactionId,
      barcode: this.barcode,
      type: this.type,
      date: this.date,
      category: this.category,
      description: this.description
    };
  }
}

export default FilingHistoryBuilder;
