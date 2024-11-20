import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import TransactionLimitedPartnership from "../../domain/entities/TransactionLimitedPartnership";
import PageRegistrationType from "../../application/registration/PageRegistrationType";

class LimitedPartnershipBuilder {
  created_at?: Date;
  updated_at?: Date;
  _id?: string;
  links?: { self: string }[];
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
    if (limitedPartnership?.links) {
      this.links = limitedPartnership.links;
    }
    if (limitedPartnership?.data) {
      this.data = { ...limitedPartnership.data };
    }
  }

  withData(
    pageType: PageRegistrationType, // used to decide where to insert data
    data: Record<string, any>
  ): LimitedPartnershipBuilder {
    this.data = { ...this.data, ...data };
    return this;
  }

  build(): TransactionLimitedPartnership {
    return {
      created_at: this.created_at,
      updated_at: this.updated_at,
      _id: this["_id"],
      data: this.data,
      links: this.links,
    };
  }
}

export default LimitedPartnershipBuilder;
