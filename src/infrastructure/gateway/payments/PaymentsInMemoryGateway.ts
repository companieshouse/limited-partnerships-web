import IPaymentsGateway from "../../../domain/IPaymentsGateway";
import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

class PaymentsInMemoryGateway implements IPaymentsGateway {

  async createPayment(
    opt: { access_token: string; refresh_token: string },
    createPaymentRequest: CreatePaymentRequest) {

    return this.generatePayment(opt, createPaymentRequest);
  }

  private generatePayment (
    opt: { access_token: string; refresh_token: string },
    createPaymentRequest: CreatePaymentRequest
  ): Payment {
    return {
      amount: "some cost amount",
      availablePaymentMethods: ["credit-card"],
      companyNumber: "C123",
      completedAt: "12-12-20",
      createdAt: "12-12-20",
      createdBy: {
        email: "email",
        forename: "forname",
        id: opt.access_token,
        surname: "surname"
      },
      description: "description",
      etag: "etag",
      kind: "kind",
      links: {
        journey: "journey",
        resource: "resource",
        self: "payment-session#payment-session"
      },
      paymentMethod: "credit-card",
      reference: createPaymentRequest.reference,
      status: "paid"
    };
  }
}
export default PaymentsInMemoryGateway;
