import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

type TransactionGeneralPartner = GeneralPartner & {
  _id?: string;
};

export default TransactionGeneralPartner;
