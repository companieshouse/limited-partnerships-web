/* eslint-disable */

import {
  LimitedPartnershipResourceCreated,
  PersonWithSignificantControl
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import IPersonWithSignificantControlGateway from "../../../domain/IPersonWithSignificantControlGateway";
import { Tokens } from "../../../domain/types";

import { removeEmptyStringValues } from "../utils";
import { SDK_LIMITED_PARTNERSHIP_SERVICE } from "../../../config/constants";
import { checkForBadRequest, makeApiCallWithRetry } from "../api";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";

export default class PersonWithSignificantControlGateway implements IPersonWithSignificantControlGateway {
  public async createPersonWithSignificantControl(
    opt: Tokens,
    transactionId: string,
    data: Partial<PersonWithSignificantControl>
  ): Promise<string> {
    const personWithSignificantControl: PersonWithSignificantControl = { data: removeEmptyStringValues(data) };

    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "postPsc",
      args: [transactionId, personWithSignificantControl]
    };

    const response = await makeApiCallWithRetry<Resource<LimitedPartnershipResourceCreated>>(opt, apiCall);

    const uiErrors = checkForBadRequest<LimitedPartnershipResourceCreated>(response);
    if (uiErrors) {
      throw uiErrors;
    }

    if (response.httpStatusCode !== 201) {
      throw response;
    }

    return response?.resource?.id ?? "";
  }

  public async getPersonWithSignificantControl(
    opt: Tokens,
    transactionId: string,
    personWithSignificantControlId: string
  ): Promise<any> {
    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "getPsc",
      args: [transactionId, personWithSignificantControlId]
    };

    const response = await makeApiCallWithRetry<Resource<PersonWithSignificantControl>>(opt, apiCall);

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return response?.resource ?? {};
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
