import { Resource } from "@companieshouse/api-sdk-node";

import IGeneralPartnerGateway from "../../../domain/IGeneralPartnerGateway";
import { checkForBadRequest, makeApiCallWithRetry } from "../api";
import { SDK_LIMITED_PARTNERSHIP_SERVICE } from "../../../config/constants";
import {
  GeneralPartner,
  LimitedPartnershipResourceCreated
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import {
  validateAndFormatPartnerPersonDateOfBirth,
  removeEmptyStringValues,
  validateAndFormatPartnerDateEffectiveFrom,
  resetFormerNamesIfPreviousNameIsFalse
} from "../utils";

class GeneralPartnerGateway implements IGeneralPartnerGateway {
  async createGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    validateAndFormatPartnerPersonDateOfBirth(data);
    validateAndFormatPartnerDateEffectiveFrom(data);
    resetFormerNamesIfPreviousNameIsFalse(data);

    const generalPartner: GeneralPartner = { data: removeEmptyStringValues(data) };

    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "postGeneralPartner",
      args: [transactionId, generalPartner]
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

  async getGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string
  ): Promise<GeneralPartner> {
    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "getGeneralPartner",
      args: [transactionId, generalPartnerId]
    };
    const response = await makeApiCallWithRetry<Resource<GeneralPartner>>(opt, apiCall);

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return response?.resource ?? {};
  }

  async getGeneralPartners(
    opt: { access_token: string; refresh_token: string },
    transactionId: string
  ): Promise<GeneralPartner[]> {
    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "getGeneralPartners",
      args: [transactionId]
    };
    const response = await makeApiCallWithRetry<Resource<GeneralPartner[]>>(opt, apiCall);

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return response?.resource ?? [];
  }

  async sendPageData(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string,
    data: Record<string, any>
  ): Promise<void> {
    validateAndFormatPartnerPersonDateOfBirth(data);
    validateAndFormatPartnerDateEffectiveFrom(data);
    resetFormerNamesIfPreviousNameIsFalse(data);

    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "patchGeneralPartner",
      args: [transactionId, generalPartnerId, removeEmptyStringValues(data, ["former_names"])]
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

  async deleteGeneralPartner(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    generalPartnerId: string
  ): Promise<void> {
    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "deleteGeneralPartner",
      args: [transactionId, generalPartnerId]
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

export default GeneralPartnerGateway;
