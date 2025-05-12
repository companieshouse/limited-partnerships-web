import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";
import { Resource } from "@companieshouse/api-sdk-node";
import IPaymentsGateway from "../../../domain/IPaymentsGateway";
import { SDK_PAYMENTS_SERVICE } from "../../../config/constants";
import { makeApiCallWithRetry } from "../api";
import { ApiResult, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

class PaymentsGateway implements IPaymentsGateway {
  async createPayment(
    opt: { access_token: string; refresh_token: string },
    createPaymentRequest: CreatePaymentRequest ): Promise<ApiResult<ApiResponse<Payment>>> {

    const apiCall = {
      service: SDK_PAYMENTS_SERVICE,
      method: "createPayment",
      args: [createPaymentRequest]
    };
    const response = await makeApiCallWithRetry<Resource<ApiResult<ApiResponse<Payment>>>>(opt, apiCall);
    if (!response?.resource) {
      throw new Error("Failed to retrieve payment resource");
    }
    return response.resource;
  }
}
