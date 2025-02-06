import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  LimitedPartnership,
  LimitedPartnershipResourceCreated
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import { checkForBadRequest, makeApiCallWithRetry } from "../api";
import RegistrationPageType from "../../../presentation/controller/registration/PageType";
import ILimitedPartnershipGateway from "../../../domain/ILimitedPartnershipGateway";
import LimitedPartnershipGatewayBuilder from "./LimitedPartnershipGatewayBuilder";
import { SDK_LIMITED_PARTNERSHIP_SERVICE } from "../../../config/constants";
import AddressPageType from "../../../presentation/controller/addressLookUp/PageType";

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
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "postLimitedPartnership",
      args: [transactionId, limitedPartnership]
    };

    const response = await makeApiCallWithRetry<
      Resource<LimitedPartnershipResourceCreated>
    >(opt, apiCall);

    const uiErrors =
      checkForBadRequest<LimitedPartnershipResourceCreated>(response);
    if (uiErrors) {
      throw uiErrors;
    }

    if (response.httpStatusCode !== 201) {
      throw response;
    }

    return response?.resource?.id ?? "";
  }

  async sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string,
    registrationType: RegistrationPageType | AddressPageType,
    data: Record<string, any>
  ): Promise<void> {
    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder();
    limitedPartnershipBuilder.withData(registrationType, data);
    const limitedPartnership = limitedPartnershipBuilder.build();

    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "patchLimitedPartnership",
      args: [transactionId, submissionId, limitedPartnership.data]
    };

    const response = await makeApiCallWithRetry<Resource<void>>(opt, apiCall);

    const uiErrors = checkForBadRequest<void>(response);
    if (uiErrors) {
      throw uiErrors;
    }

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
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
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
}

export default LimitedPartnershipGateway;
