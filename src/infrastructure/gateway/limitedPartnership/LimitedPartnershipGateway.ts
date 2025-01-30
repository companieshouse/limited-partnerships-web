import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  LimitedPartnership,
  LimitedPartnershipResourceCreated
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import { makeApiCallWithRetry } from "../api";
import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import ILimitedPartnershipGateway from "../../../domain/ILimitedPartnershipGateway";
import LimitedPartnershipGatewayBuilder from "./LimitedPartnershipGatewayBuilder";
import UIErrors from "../../../domain/entities/UIErrors";

class LimitedPartnershipGateway implements ILimitedPartnershipGateway {
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
      args: [transactionId, limitedPartnership]
    };

    const response = await makeApiCallWithRetry<
      Resource<LimitedPartnershipResourceCreated> | ApiErrorResponse
    >(opt, apiCall);

    this.throwUIErrorsIf400Status(response);

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
    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder();
    limitedPartnershipBuilder.withData(registrationType, data);
    const limitedPartnership = limitedPartnershipBuilder.build();

    const apiCall = {
      service: "limitedPartnershipsService",
      method: "patchLimitedPartnership",
      args: [transactionId, submissionId, limitedPartnership.data]
    };

    const response = await makeApiCallWithRetry<
      Resource<void> | ApiErrorResponse
    >(opt, apiCall);

    this.throwUIErrorsIf400Status(response);

    if (response.httpStatusCode !== 200) {
      throw response;
    }
  }

  async getLimitedPartnership(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string
  ): Promise<LimitedPartnership> {
    const apiCall = {
      service: "limitedPartnershipsService",
      method: "getLimitedPartnership",
      args: [transactionId, submissionId]
    };

    const response = await makeApiCallWithRetry<
      Resource<LimitedPartnership> | ApiErrorResponse
    >(opt, apiCall);

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return (response as Resource<LimitedPartnership>)?.resource ?? {};
  }

  private throwUIErrorsIf400Status(
    response: Resource<LimitedPartnershipResourceCreated | void> | ApiErrorResponse
  ) {
    if (response.httpStatusCode === 400) {
      const uiErrors = new UIErrors();
      uiErrors.formatValidationErrorToUiErrors(
        (response as Resource<any>)?.resource
      );

      throw uiErrors;
    }
  }
}

export default LimitedPartnershipGateway;
