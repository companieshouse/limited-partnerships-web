import { FilingHistoryItem } from "@companieshouse/api-sdk-node/dist/services/company-filing-history/types";

class FilingHistoryBuilder {
  private type = "LPTS01";
  private readonly transactionId = "NGA0NDcwMzcyMWFkaXF6a2N4";
  private readonly barcode = "8G3ZMW4B";
  private readonly date = "2025-08-06";
  private readonly category = "incorporation";
  private readonly description = "transition-of-limited-partnership";

  withType(type: string): this {
    this.type = type;
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
