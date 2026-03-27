/* eslint-disable */

import IPersonWithSignificantControlGateway from "../../../domain/IPersonWithSignificantControlGateway";
import { Tokens } from "../../../domain/types";
import UIErrors, { ApiErrors } from "../../../domain/entities/UIErrors";
import TransactionPersonWithSignificantControl from "../../../domain/entities/TransactionPersonWithSignificantControl";

export default class PersonWithSignificantControlInMemoryGateway implements IPersonWithSignificantControlGateway {
  personWithSignificantControlId = crypto.randomUUID().toString();
  personsWithSignificantControl: TransactionPersonWithSignificantControl[] = [];
  uiErrors: UIErrors = new UIErrors();

  public feedPersonsWithSignificantControl(data: TransactionPersonWithSignificantControl[]) {
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
    return this.personsWithSignificantControl.find((psc) => psc._id === personWithSignificantControlId);
  }

  public async sendPageData(
    _opt: Tokens,
    _transactionId: string,
    personWithSignificantControlId: string,
    data: Record<string, any>
  ): Promise<void> {
    if (this.uiErrors?.hasErrors()) {
      throw this.uiErrors;
    }

    const index = this.personsWithSignificantControl.findIndex((psc) => psc._id === personWithSignificantControlId);

    if (index === -1) {
      throw new Error(`Not found: ${personWithSignificantControlId}`);
    }

    this.personsWithSignificantControl[index].data = { ...this.personsWithSignificantControl[index].data, ...data };
  }
}
