/* eslint-disable */

import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  LimitedPartnership,
  LimitedPartnershipCreated,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import { makeApiCallWithRetry } from "../api";
import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import LimitedPartnershipGatewayBuilder from "./LimitedPartnershipGatewayBuilder";

class RegistrationGateway implements IRegistrationGateway {
  async createTransaction(
    opt: { access_token: string; refresh_token: string },
    registrationPageType: RegistrationPageType
  ): Promise<string> {
    const apiCall = {
      service: "transaction",
      method: "postTransaction",
      args: [
        {
          reference: "LimitedPartnershipsReference",
          description: "Limited Partnerships Transaction",
        },
      ],
    };

    const response = await makeApiCallWithRetry<
      Resource<Transaction> | ApiErrorResponse
    >(opt, apiCall);

    if (response.httpStatusCode !== 201) {
      throw response;
    }

    return (response as Resource<Transaction>)?.resource?.id ?? "";
  }

  async createSubmission(
    opt: { access_token: string; refresh_token: string },
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder();
    limitedPartnershipBuilder.withData(registrationPageType, data);
    const limitedPartnership = limitedPartnershipBuilder.build();

    const apiCall = {
      service: "limitedPartnershipsService",
      method: "postLimitedPartnership",
      args: [transactionId, limitedPartnership],
    };

    const response = await makeApiCallWithRetry<
      Resource<LimitedPartnershipCreated> | ApiErrorResponse
    >(opt, apiCall);

    if (response.httpStatusCode !== 201) {
      throw response;
    }

    return (response as Resource<Transaction>)?.resource?.id ?? "";
  }

  async sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string,
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<void> {
    const apiCall = {
      service: "limitedPartnershipsService",
      method: "patchLimitedPartnership",
      args: [
        transactionId,
        submissionId,
        {
          type: registrationType,
          data,
        },
      ],
    };

    const response = await makeApiCallWithRetry<
      Resource<void> | ApiErrorResponse
    >(opt, apiCall);

    if (response.httpStatusCode !== 200) {
      throw response;
    }
  }

  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    throw new Error("Method not implemented.");
  }
}

export default RegistrationGateway;
