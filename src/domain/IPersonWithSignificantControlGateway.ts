import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import { Tokens } from "./types";

interface IPersonWithSignificantControlGateway {
  createPersonWithSignificantControl(
    opt: Tokens,
    transactionId: string,
    data: Partial<PersonWithSignificantControl>
  ): Promise<string>;

  getPersonWithSignificantControl(
    opt: Tokens,
    transactionId: string,
    personWithSignificantControlId: string
  ): Promise<PersonWithSignificantControl>;

  sendPageData(
    opt: Tokens,
    transactionId: string,
    personWithSignificantControlId: string,
    data: Partial<PersonWithSignificantControl>
  ): Promise<void>;
}

export default IPersonWithSignificantControlGateway;
