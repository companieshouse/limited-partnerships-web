/* eslint-disable */

import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import IPersonWithSignificantControlGateway from "../../../domain/IPersonWithSignificantControlGateway";
import { Tokens } from "../../../domain/types";

export default class PersonWithSignificantControlGateway implements IPersonWithSignificantControlGateway {
  public async createPersonWithSignificantControl(
    _opt: Tokens,
    _transactionId: string,
    _data: Partial<PersonWithSignificantControl>
  ): Promise<string> {
    return "";
  }

  public async getPersonWithSignificantControl(
    _opt: Tokens,
    _transactionId: string,
    _personWithSignificantControlId: string
  ): Promise<any> {
    return null;
  }

  public async sendPageData(
    _opt: Tokens,
    _transactionId: string,
    _personWithSignificantControlId: string,
    _data: Partial<PersonWithSignificantControl>
  ): Promise<void> {
    return;
  }
}
