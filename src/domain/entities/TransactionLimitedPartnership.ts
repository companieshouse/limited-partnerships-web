import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

type TransactionLimitedPartnership = LimitedPartnership & {
  _id?: string;
  created_at?: Date;
  updated_at?: Date;
  links?: { self: string }[];
};

export default TransactionLimitedPartnership;
