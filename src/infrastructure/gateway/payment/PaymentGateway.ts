import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";
import IPaymentGateway from "../../../domain/IPaymentGateway";
import { SDK_PAYMENT_SERVICE } from "../../../config/constants";
import { makeApiCallWithRetry } from "../api";
import { ApiResult, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { logger } from "../../../utils/logger";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

class PaymentGateway implements IPaymentGateway {
  async createPayment(
    opt: { access_token: string; refresh_token: string },
    createPaymentRequest: CreatePaymentRequest,
    startPaymentSessionUrl: string ): Promise<Payment> {

    console.log("\n\n\n\n>>>>>>>>>>>>>>>>>> start payment session url " + startPaymentSessionUrl);
    const apiClient: ApiClient = createApiClient(undefined, opt.access_token, startPaymentSessionUrl);
    const response = await apiClient.payment.createPaymentWithFullUrl(createPaymentRequest);
   /*
    const apiCall = {
      service: SDK_PAYMENT_SERVICE,
      method: "createPaymentWithFullUrl",
      args: [createPaymentRequest]
    };

    const response = await makeApiCallWithRetry<ApiResult<ApiResponse<Payment>>>(opt, apiCall);
    */
    console.log("\n\n\n\n>>>>>>>>>>>>>>>>>> payment response " + JSON.stringify(response));
    if (response.isFailure() || !response.isSuccess()) {
      const errorResponse = response.value;
      const msgErrorStatusCode = `http response status code=${ errorResponse?.httpStatusCode ?? "No Status Code found in response" }`;
      const msgErrorResponse = `http errors response=${ JSON.stringify(errorResponse?.errors ?? "No Errors found in response") }`;
      const msgError = `payment.service failure to create payment, ${msgErrorStatusCode}, ${msgErrorResponse}.`;

      throw new Error(msgError);
    }

    if (!response.value?.resource) {
      throw new Error("Failed to retrieve payment resource");
    }

    const paymentResource: Payment = response.value.resource;
    logger.info(`Create payment, status_code=${ response.value.httpStatusCode }, status=${ paymentResource.status }, links= ${ JSON.stringify(paymentResource.links ) } `);

    return paymentResource;

  }
}

export default PaymentGateway;
