import { Resource } from "@companieshouse/api-sdk-node";

import ILimitedPartnerGateway from "../../../domain/ILimitedPartnerGateway";
import { checkForBadRequest, makeApiCallWithRetry } from "../api";
import { SDK_LIMITED_PARTNERSHIP_SERVICE } from "../../../config/constants";
import {
  LimitedPartner,
  LimitedPartnershipResourceCreated
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import {
  validateAndFormatPartnerPersonDateOfBirth,
  removeEmptyStringValues,
  validateAndFormatPartnerDateEffectiveFrom,
  resetFormerNamesIfPreviousNameIsFalse,
  validateAndFormatPartnerCeaseDate,
  validateFormerNamesNotEmptyIfPreviousNameIsTrue,
  validateAndFormatPartnerDateOfUpdate
} from "../utils";

class LimitedPartnerGateway implements ILimitedPartnerGateway {
  private readonly partnerType = "limited";

  async createLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    validateAndFormatPartnerPersonDateOfBirth(data);
    validateAndFormatPartnerDateEffectiveFrom(data);
    validateFormerNamesNotEmptyIfPreviousNameIsTrue(data, this.partnerType);
    resetFormerNamesIfPreviousNameIsFalse(data);
    validateAndFormatPartnerCeaseDate(data);

    const limitedPartner: LimitedPartner = { data: removeEmptyStringValues(data) };

    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "postLimitedPartner",
      args: [transactionId, limitedPartner]
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

  async getLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string
  ): Promise<LimitedPartner> {
    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "getLimitedPartner",
      args: [transactionId, limitedPartnerId]
    };
    const response = await makeApiCallWithRetry<Resource<LimitedPartner>>(opt, apiCall);

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return response?.resource ?? {};
  }

  async getLimitedPartners(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<LimitedPartner[]> {
    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "getLimitedPartners",
      args: [transactionId]
    };
    const response = await makeApiCallWithRetry<Resource<LimitedPartner[]>>(opt, apiCall);

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return response?.resource ?? [];
  }

  async sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string,
    data: Record<string, any>
  ): Promise<void> {
    validateAndFormatPartnerPersonDateOfBirth(data);
    validateAndFormatPartnerDateEffectiveFrom(data);
    validateFormerNamesNotEmptyIfPreviousNameIsTrue(data, this.partnerType);
    resetFormerNamesIfPreviousNameIsFalse(data);
    validateAndFormatPartnerCeaseDate(data);
    validateAndFormatPartnerDateOfUpdate(data);

    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "patchLimitedPartner",
      args: [transactionId, limitedPartnerId, removeEmptyStringValues(data, ["former_names"])]
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

  async deleteLimitedPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    limitedPartnerId: string
  ): Promise<void> {
    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "deleteLimitedPartner",
      args: [transactionId, limitedPartnerId]
    };

    const response = await makeApiCallWithRetry<Resource<void>>(opt, apiCall);

    const uiErrors = checkForBadRequest<void>(response);
    if (uiErrors) {
      throw uiErrors;
    }

    if (response.httpStatusCode !== 204) {
      throw response;
    }
  }
}

export default LimitedPartnerGateway;
