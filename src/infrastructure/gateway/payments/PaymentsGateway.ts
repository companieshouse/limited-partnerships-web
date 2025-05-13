import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";
import { Resource } from "@companieshouse/api-sdk-node";
import IPaymentsGateway from "../../../domain/IPaymentsGateway";
import { SDK_PAYMENTS_SERVICE } from "../../../config/constants";
import { makeApiCallWithRetry } from "../api";
import { ApiResult, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { logger } from "../../../utils/logger";

class PaymentsGateway implements IPaymentsGateway {
  async createPayment(
    opt: { access_token: string; refresh_token: string },
    createPaymentRequest: CreatePaymentRequest ): Promise<Payment> {

    const apiCall = {
      service: SDK_PAYMENTS_SERVICE,
      method: "createPayment",
      args: [createPaymentRequest]
    };

    const response = await makeApiCallWithRetry<Resource<ApiResult<ApiResponse<Payment>>>>(opt, apiCall);
    if (!response?.resource) {
      throw new Error("Failed to retrieve payment resource");
    }

    if (response.httpStatusCode !== 201) {
      throw response;
    }

    const responseContent = response.resource;

    if (responseContent.isFailure() || !responseContent.isSuccess()) {
      const errorResponse = responseContent.value;
      const msgErrorStatusCode = `http response status code=${ errorResponse?.httpStatusCode || "No Status Code found in response" }`;
      const msgErrorResponse = `http errors response=${ JSON.stringify(errorResponse?.errors || "No Errors found in response") }`;
      const msgError = `payment.service failure to create payment, ${msgErrorStatusCode}, ${msgErrorResponse}.`;

      throw new Error(msgError);
    } else if (!responseContent.value?.resource) {
      throw new Error("Failed to retrieve payment resource");
    } else {
      const paymentResource: Payment = responseContent.value.resource;
      logger.info(`Create payment, status_code=${ responseContent.value.httpStatusCode }, status=${ paymentResource.status }, links= ${ JSON.stringify(paymentResource.links ) } `);

      return paymentResource;
    }
  }
}
