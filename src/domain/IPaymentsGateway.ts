import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

interface IPaymentsGateway {
    createPayment(
        opt: { access_token: string; refresh_token: string },
        createPaymentRequest: CreatePaymentRequest
    ): Promise<Payment>
}

export default IPaymentsGateway;
