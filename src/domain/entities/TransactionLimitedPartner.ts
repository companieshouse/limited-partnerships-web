import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

type TransactionLimitedPartner = LimitedPartner & {
  _id?: string;
};

export default TransactionLimitedPartner;
