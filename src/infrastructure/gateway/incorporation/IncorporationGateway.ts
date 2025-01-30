import { Resource } from "@companieshouse/api-sdk-node";
import { LimitedPartnershipResourceCreated } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import { IIncorporationGateway } from "../../../domain/IIncorporationGateway";
import PageType from "../../../presentation/controller/PageType";
import { errors400, makeApiCallWithRetry } from "../api";

class IncorporationGateway implements IIncorporationGateway {
  SDK_LIMITED_PARTNERSHIP_SERVICE = "limitedPartnershipsService";

  async createIncorporation(
    opt: {
      access_token: string;
      refresh_token: string;
    },
    pageType: PageType,
    transactionId: string
  ): Promise<string> {
    const apiCall = {
      service: this.SDK_LIMITED_PARTNERSHIP_SERVICE,
      method: "postLimitedPartnershipIncorporation",
      args: [transactionId]
    };

    const response = await makeApiCallWithRetry<
      Resource<LimitedPartnershipResourceCreated>
    >(opt, apiCall);

    const uiErrors = errors400<LimitedPartnershipResourceCreated>(response);
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
