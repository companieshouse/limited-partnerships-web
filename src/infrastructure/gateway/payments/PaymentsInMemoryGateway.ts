import IPaymentsGateway from "../../../domain/IPaymentsGateway";
import { Payment, CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";
import { StatusCodes } from "http-status-codes";
import { ApiResult, ApiResponse, ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Failure, Success } from "@companieshouse/api-sdk-node/dist/services/result";

class PaymentsInMemoryGateway implements IPaymentsGateway {

  async createPayment(
    opt: { access_token: string; refresh_token: string },
    createPaymentRequest: CreatePaymentRequest) {
    return await generatePaymentResult(opt, createPaymentRequest);
  }
}

function generatePaymentResult(
  opt: { access_token: string; refresh_token: string },
  createPaymentRequest: CreatePaymentRequest):
  ApiResult<ApiResponse<Payment>> {
  return {
    isFailure (): this is Failure<ApiResponse<Payment>, ApiErrorResponse> {
      return false;
    },
    isSuccess (): this is Success<ApiResponse<Payment>, ApiErrorResponse> {
      return true;
    },
    value: {
      httpStatusCode: StatusCodes.CREATED,
      headers: {},
      resource: generatePayment(opt, createPaymentRequest)
    }
  };
}

function generatePayment (
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

export default PaymentsInMemoryGateway;
