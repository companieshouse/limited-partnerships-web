import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionLimitedPartnership from "../../../domain/entities/TransactionLimitedPartnership";
import PageType from "../../../presentation/controller/PageType";

class LimitedPartnershipGatewayBuilder {
  created_at?: Date;
  updated_at?: Date;
  _id?: string;
  data?: LimitedPartnership["data"];

  constructor(limitedPartnership?: TransactionLimitedPartnership) {
    if (limitedPartnership?.["_id"]) {
      this["_id"] = limitedPartnership["_id"];
    }
    if (limitedPartnership?.data) {
      this.data = { ...limitedPartnership.data };
    }
  }

  withData(
    pageType: PageType, // used to decide where to insert data
    data: Record<string, any>
  ) {
    delete data["_csrf"];
    delete data.pageType;

    this.data = { ...this.data, ...data };

    return this;
  }

  build(): TransactionLimitedPartnership {
    return {
      _id: this["_id"],
      data: this.data,
    };
  }
}

export default LimitedPartnershipGatewayBuilder;
