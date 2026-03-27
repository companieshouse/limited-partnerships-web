/* eslint-disable */

import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import IPersonWithSignificantControlGateway from "../../../domain/IPersonWithSignificantControlGateway";
import { Tokens } from "../../../domain/types";
import UIErrors, { ApiErrors } from "../../../domain/entities/UIErrors";

export default class PersonWithSignificantControlInMemoryGateway implements IPersonWithSignificantControlGateway {
  personWithSignificantControlId = crypto.randomUUID().toString();
  personsWithSignificantControl: PersonWithSignificantControl[] = [];
  uiErrors: UIErrors = new UIErrors();

  public feedPersonsWithSignificantControl(data: PersonWithSignificantControl[]) {
    this.personsWithSignificantControl = data || [];
  }

  public feedErrors(errors?: ApiErrors) {
    this.uiErrors.errors.errorList = [];

    if (!errors) {
      return;
    }

    this.uiErrors.formatValidationErrorToUiErrors(errors);
  }

  public async createPersonWithSignificantControl(
    _opt: Tokens,
    _transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    if (this.uiErrors?.hasErrors()) {
      throw this.uiErrors;
    }

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
