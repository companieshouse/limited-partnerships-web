import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import IPaymentGateway from "../../domain/IPaymentGateway";
import { v4 as uuidv4 } from 'uuid';
import { 
    CHS_URL, 
    PAYMENTS_API_URL, 
    PAYMENT, REFERENCE,
    REGISTRATION_WITH_IDS_URL
 } from "../../config/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "./utils";

class PaymentService {
  constructor(
    private paymentGateway: IPaymentGateway
  ) {}

  async startPaymentSession (
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string
  ) {    
    const createPaymentRequest: CreatePaymentRequest = this.buildCreatePaymentRequest(transactionId, submissionId);
    const paymentResource: Payment = await this.paymentGateway.createPayment(opt, createPaymentRequest);
    return paymentResource.links.journey;
  }

  private buildCreatePaymentRequest(transactionId: string, submissionId: string, baseURL?: string) {

    if (!baseURL) {
      baseURL = `${CHS_URL}${REGISTRATION_WITH_IDS_URL}`;
    }

    const paymentResourceUri = `${PAYMENTS_API_URL}/transactions/${transactionId}/${PAYMENT}`;
    const reference = `${REFERENCE}_${transactionId}`;
    const activeSubmissionBasePathWithIds = getUrlWithTransactionIdAndSubmissionId(baseURL, transactionId, submissionId);
    const redirectUri = `${activeSubmissionBasePathWithIds}${PAYMENT}`;

    return {
      resource: paymentResourceUri,
      state: uuidv4(),
      redirectUri,
      reference
    };
  }
}

export default PaymentService;
