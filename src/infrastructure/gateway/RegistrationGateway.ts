/* eslint-disable */

import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";

import RegistrationPageType from "../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import { API_KEY } from "../../config/constants";

class RegistrationGateway implements IRegistrationGateway {
  private readonly api = createApiClient(API_KEY);

  async createTransaction(
    access_token: string,
    registrationPageType: RegistrationPageType
  ): Promise<string> {
    const api = createApiClient(undefined, access_token);

    const response = await api.transaction.postTransaction({
      reference: "LimitedPartnershipsReference",
      description: "Limited Partnerships Transaction",
    });

    if (response.httpStatusCode !== 201) {
      throw response;
    }

    return (response as Resource<Transaction>)?.resource?.id ?? "";
  }

  async createSubmission(
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    return crypto.randomUUID().toString();
  }

  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    throw new Error("Method not implemented.");
  }
}

export default RegistrationGateway;
