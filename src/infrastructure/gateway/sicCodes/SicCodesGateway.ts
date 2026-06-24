import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";
import { CHS_API_KEY, SDK_SIC_CODES_SERVICE } from "../../../config";
import ISicCodesGateway from "../../../domain/ISicCodesGateway";
import { makeApiCallWithRetry } from "../api";
import { Resource } from "@companieshouse/api-sdk-node";

class SicCodesGateway implements ISicCodesGateway {
  async getSicCodes(): Promise<{ sic_code: string; sic_description: string }[]> {

    const apiCall = {
      service: SDK_SIC_CODES_SERVICE,
      method: "getCondensedSicCodes",
      args: []
    };

    const response = await makeApiCallWithRetry<Resource<CondensedSicCodeData[]>>({ access_token: "", refresh_token: "" }, apiCall, CHS_API_KEY);

    if (response.httpStatusCode !== 200) {
      throw response;
    }

    return response?.resource ?? [];
  }
}

export default SicCodesGateway;
