import { FilingHistoryItem } from "@companieshouse/api-sdk-node/dist/services/company-filing-history/types";

class FilingHistoryBuilder {
  private transactionId = "NGA0NDcwMzcyMWFkaXF6a2N4";
  private barcode = "8G3ZMW4B";
  private type = "LPTS01";
  private date = "2025-08-06";
  private category = "incorporation";
  private description = "transition-of-limited-partnership";

  withTransactionId(transactionId: string): FilingHistoryBuilder {
    this.transactionId = transactionId;
    return this;
  }

  withBarcode(barcode: string): FilingHistoryBuilder {
    this.barcode = barcode;
    return this;
  }

  withType(type: string): FilingHistoryBuilder {
    this.type = type;
    return this;
  }

  withDate(date: string): FilingHistoryBuilder {
    this.date = date;
    return this;
  }

  withCategory(category: string): FilingHistoryBuilder {
    this.category = category;
    return this;
  }

  withDescription(description: string): FilingHistoryBuilder {
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
