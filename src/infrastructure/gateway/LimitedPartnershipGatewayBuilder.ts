import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionLimitedPartnership from "../../domain/entities/TransactionLimitedPartnership";
import PageType from "../../presentation/controller/PageType";

class LimitedPartnershipGatewayBuilder {
  created_at?: Date;
  updated_at?: Date;
  _id?: string;
  data?: LimitedPartnership["data"];

  constructor(limitedPartnership: TransactionLimitedPartnership) {
    if (limitedPartnership?.created_at) {
      this.created_at = limitedPartnership.created_at;
    }
    if (limitedPartnership?.updated_at) {
      this.updated_at = limitedPartnership.updated_at;
    }
    if (limitedPartnership["_id"]) {
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
    this.data = { ...this.data, ...data };
    return this;
  }

  build(): TransactionLimitedPartnership {
    return {
      created_at: this.created_at,
      updated_at: this.updated_at,
      _id: this["_id"],
      data: this.data,
    };
  }
}

export default LimitedPartnershipGatewayBuilder;
