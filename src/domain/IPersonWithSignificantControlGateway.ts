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

  getPersonsWithSignificantControl(
    opt: Tokens,
    transactionId: string
  ): Promise<PersonWithSignificantControl[]>;

  sendPageData(
    opt: Tokens,
    transactionId: string,
    personWithSignificantControlId: string,
    data: Partial<PersonWithSignificantControl>
  ): Promise<void>;

  deletePersonWithSignificantControl(
    opt: Tokens,
    transactionId: string,
    personWithSignificantControlId: string
  ): Promise<void>;
}

export default IPersonWithSignificantControlGateway;
