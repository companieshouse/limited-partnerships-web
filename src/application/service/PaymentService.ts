import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import IPaymentGateway from "@domain/IPaymentGateway";
import { v4 as uuidv4 } from 'uuid';
import {
  API_URL,
  PAYMENT,
  REFERENCE
} from "@config/constants";

class PaymentService {
  constructor(
    private readonly paymentGateway: IPaymentGateway
  ) {}

  async startPaymentSession (
    opt: { access_token: string; refresh_token: string },
    startPaymentSessionUrl: string,
    paymentReturnUri: string,
    transactionId: string
  ) {
    const createPaymentRequest: CreatePaymentRequest = this.buildCreatePaymentRequest(paymentReturnUri, transactionId);
    const paymentResource: Payment = await this.paymentGateway.createPayment(opt, createPaymentRequest, startPaymentSessionUrl);
    return paymentResource.links.journey;
  }

  private buildCreatePaymentRequest(paymentReturnUri: string, transactionId: string) {

    const paymentResourceUri = `${API_URL}/transactions/${transactionId}/${PAYMENT}`;
    const reference = `${REFERENCE}_${transactionId}`;

    return {
      resource: paymentResourceUri,
      state: uuidv4(),
      redirectUri: paymentReturnUri,
      reference
    };
  }
}

export default PaymentService;
