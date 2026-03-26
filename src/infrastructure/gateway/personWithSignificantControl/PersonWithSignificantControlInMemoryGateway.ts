/* eslint-disable */

import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import IPersonWithSignificantControlGateway from "../../../domain/IPersonWithSignificantControlGateway";
import { Tokens } from "../../../domain/types";

export default class PersonWithSignificantControlInMemoryGateway implements IPersonWithSignificantControlGateway {
  private personWithSignificantControlId = crypto.randomUUID().toString();

  private personsWithSignificantControl: PersonWithSignificantControl[] = [];

  public feedPersonsWithSignificantControl(data: PersonWithSignificantControl[]) {
    this.personsWithSignificantControl = data || [];
  }

  public async createPersonWithSignificantControl(
    _opt: Tokens,
    _transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    this.personsWithSignificantControl.push({ data });

    return this.personWithSignificantControlId;
  }

  public async getPersonWithSignificantControl(
    _opt: Tokens,
    _transactionId: string,
    personWithSignificantControlId: string
  ): Promise<any> {
    return this.personsWithSignificantControl.find((p) => p.id === personWithSignificantControlId);
  }

  public async sendPageData(
    _opt: Tokens,
    _transactionId: string,
    personWithSignificantControlId: string,
    data: Record<string, any>
  ): Promise<void> {
    const idx = this.personsWithSignificantControl.findIndex((p) => p.id === personWithSignificantControlId);

    if (idx !== -1) {
      this.personsWithSignificantControl[idx].data = { ...this.personsWithSignificantControl[idx].data, ...data };
    }
  }
}
