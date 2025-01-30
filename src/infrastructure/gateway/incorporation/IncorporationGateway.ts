import { Resource } from "@companieshouse/api-sdk-node";
import { LimitedPartnershipResourceCreated } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import { IIncorporationGateway } from "../../../domain/IIncorporationGateway";
import PageType from "../../../presentation/controller/PageType";
import { checkForBadRequest, makeApiCallWithRetry } from "../api";
import { SDK_LIMITED_PARTNERSHIP_SERVICE } from "../../../config/constants";

class IncorporationGateway implements IIncorporationGateway {
  async createIncorporation(
    opt: {
      access_token: string;
      refresh_token: string;
    },
    pageType: PageType,
    transactionId: string
  ): Promise<string> {
    const apiCall = {
      service: SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "postLimitedPartnershipIncorporation",
      args: [transactionId]
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
}

export default IncorporationGateway;
