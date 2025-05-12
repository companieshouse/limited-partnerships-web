import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";
import { ApiResult, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

interface IPaymentsGateway {
    createPayment(
        opt: { access_token: string; refresh_token: string },
        createPaymentRequest: CreatePaymentRequest
    ): Promise<ApiResult<ApiResponse<Payment>>>
}

export default IPaymentsGateway;
