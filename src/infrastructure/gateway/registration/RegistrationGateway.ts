/* eslint-disable */

import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";

import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import LimitedPartnershipGatewayBuilder from "./LimitedPartnershipGatewayBuilder";

class RegistrationGateway implements IRegistrationGateway {
  async createTransaction(
    opt: { access_token: string },
    registrationPageType: RegistrationPageType
  ): Promise<string> {
    const api = this.createApi(opt.access_token);

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
    opt: { access_token: string },
    registrationPageType: RegistrationPageType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder();
    limitedPartnershipBuilder.withData(registrationPageType, data);
    const limitedPartnership = limitedPartnershipBuilder.build();

    const api = this.createApi(opt.access_token);

    const response =
      await api.limitedPartnershipsService.postLimitedPartnership(
        transactionId,
        limitedPartnership
      );

    if (response.httpStatusCode !== 201) {
      throw response;
    }

    return (response as Resource<Transaction>)?.resource?.id ?? "";
  }

  async sendPageData(
    opt: { access_token: string },
    transactionId: string,
    submissionId: string,
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<void> {
    const api = this.createApi(opt.access_token);

    const response =
      await api.limitedPartnershipsService.patchLimitedPartnership(
        transactionId,
        submissionId,
        {
          type: registrationType,
          data
        }
      );

    if (response.httpStatusCode !== 200) {
      throw response;
    }
  }

  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    throw new Error("Method not implemented.");
  }

  private createApi(access_token: string) {
    return createApiClient(undefined, access_token);
  }
}

export default RegistrationGateway;
