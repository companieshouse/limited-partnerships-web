import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

type TransactionPersonWithSignificantControl = PersonWithSignificantControl & {
  _id?: string;
};

export default TransactionPersonWithSignificantControl;
