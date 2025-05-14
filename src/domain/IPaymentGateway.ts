import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

interface IPaymentGateway {
    createPayment(
        opt: { access_token: string; refresh_token: string },
        createPaymentRequest: CreatePaymentRequest
    ): Promise<Payment>
}

export default IPaymentGateway;
