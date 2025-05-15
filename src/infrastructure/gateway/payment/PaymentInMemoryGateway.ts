import IPaymentsGateway from "../../../domain/IPaymentGateway";
import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

class PaymentsInMemoryGateway implements IPaymentsGateway {

  async createPayment (
    _opt: { access_token: string; refresh_token: string },
    createPaymentRequest: CreatePaymentRequest) {

    return await this.generatePayment(createPaymentRequest);
  }

  private generatePayment (
    createPaymentRequest: CreatePaymentRequest
  ): Payment {
    return {
      amount: "amount",
      availablePaymentMethods: ["credit-card", "account"],
      companyNumber: "companyNumber",
      completedAt: "12-12-20",
      createdAt: "12-12-20",
      createdBy: {
        email: "email",
        forename: "forname",
        id: "0000001",
        surname: "surname"
      },
      description: "description",
      etag: "etag",
      kind: "kind",
      links: {
        journey: "http://api-payments.chs.local:4001",
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
