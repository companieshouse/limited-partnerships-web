import IPaymentsGateway from "../../../domain/IPaymentGateway";
import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

class PaymentsInMemoryGateway implements IPaymentsGateway {

  payment: Payment = {
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
      journey: "https://api-test-payments.chs.local:4001",
      resource: "resource",
      self: "payment-session#payment-session"
    },
    paymentMethod: "credit-card",
    reference: "reference",
    status: "paid"
  };

  lastCreatePaymentRequest?: CreatePaymentRequest;

  feedPaymentWithEmptyJourney() {
    this.payment = {
      ...this.payment,
      links: {
        journey: "",
        resource: "resource",
        self: "payment-session#payment-session"
      }
    };
  }

  async createPayment (
    _opt: { access_token: string; refresh_token: string },
    createPaymentRequest: CreatePaymentRequest,
    _startPaymentSessionUrl: string
  ) {
    this.lastCreatePaymentRequest = createPaymentRequest;
    return await Promise.resolve(this.payment);
  }
}
export default PaymentsInMemoryGateway;
