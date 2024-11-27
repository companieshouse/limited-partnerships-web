// will be removed after these fields are added to the LimitedPartnership structure in the sdk

import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

type TransactionLimitedPartnership = LimitedPartnership & {
  _id?: string;
  created_at?: Date;
  updated_at?: Date;
};

export default TransactionLimitedPartnership;
