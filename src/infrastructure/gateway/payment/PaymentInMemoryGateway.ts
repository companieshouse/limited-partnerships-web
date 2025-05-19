import IPaymentsGateway from "../../../domain/IPaymentGateway";
import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

class PaymentsInMemoryGateway implements IPaymentsGateway {

  payment: Payment;

  feedPayment() {
    this.payment = {
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
      reference: "reference",
      status: "paid"
    };
  }

  feedPaymentWithNoRedirect() {
    this.payment = {
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
        journey: "",
        resource: "resource",
        self: "payment-session#payment-session"
      },
      paymentMethod: "credit-card",
      reference: "reference",
      status: "paid"
    };
  }

  async createPayment (
    _opt: { access_token: string; refresh_token: string },
    _createPaymentRequest: CreatePaymentRequest,
    _startPaymentSessionUrl: string) {

    return await this.generatePayment();
  }

  private generatePayment (): Payment {
    return this.payment;
  }
}
export default PaymentsInMemoryGateway;
