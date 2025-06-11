import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

import request from "supertest";
import app from "../app";

import { appDevDependencies } from "../../../../config/dev-dependencies";
import { CONFIRMATION_URL, RESUME_JOURNEY_URL } from "../../../../presentation/controller/global/url";
import { WHICH_TYPE_WITH_IDS_URL } from "../../../../presentation/controller/registration/url";
import { COMPANY_NUMBER_URL } from "../../../../presentation/controller/transition/url";
import { getUrl } from "../../utils";
import { CHS_URL, JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";
import { TransactionKind, TransactionStatus } from "../../../../domain/entities/TransactionTypes";

function buildTransaction(
  filingMode: string,
  status: string = TransactionStatus.open
): Transaction {
  return {
    id: appDevDependencies.transactionGateway.transactionId,
    status,
    filingMode
  } as Transaction;
}

describe("Resume a journey", () => {
  const RESUME_URL = getUrl(RESUME_JOURNEY_URL);

  beforeEach(() => {
    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.transactionGateway.setError(false);
    // Clear previous requests
    appDevDependencies.paymentGateway.lastCreatePaymentRequest = undefined;
  });

  it.each([
    {
      filingMode: TransactionKind.registration,
      expectedLocation: getUrl(WHICH_TYPE_WITH_IDS_URL)
    },
    {
      filingMode: TransactionKind.transition,
      expectedLocation: getUrl(COMPANY_NUMBER_URL)
    }
  ])(
    "should resume a no payment $filingMode journey",
    async ({ filingMode, expectedLocation }) => {
      const transaction = buildTransaction(filingMode);

      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(RESUME_URL);

      expect(res.status).toEqual(302);
      expect(res.headers.location).toEqual(expectedLocation);
    }
  );

  it.each([
    {
      filingMode: TransactionKind.registration,
      expectedPaymentReturnUrl: getUrl(`${CHS_URL}${CONFIRMATION_URL}`).replace(JOURNEY_TYPE_PARAM, Journey.registration)
    },
    {
      filingMode: TransactionKind.transition,
      expectedPaymentReturnUrl: getUrl(`${CHS_URL}${CONFIRMATION_URL}`).replace(JOURNEY_TYPE_PARAM, Journey.transition)
    }
  ])(
    "should resume a pay now $filingMode journey",
    async ({ filingMode, expectedPaymentReturnUrl }) => {
      const transaction = buildTransaction(filingMode, TransactionStatus.closedPendingPayment);
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(RESUME_URL);

      expect(res.status).toEqual(302);
      expect(res.headers.location).toEqual(appDevDependencies.paymentGateway.payment.links.journey);

      // Assert the payment return Url
      expect(appDevDependencies.paymentGateway.lastCreatePaymentRequest?.redirectUri)
        .toEqual(expectedPaymentReturnUrl);
    }
  );

  it.each([
    { filingMode: undefined as unknown as string, description: "undefined" },
    { filingMode: "", description: "empty string" }
  ])(
    "should throw error if transaction filing mode is $description",
    async ({ filingMode }) => {
      const transaction = buildTransaction(filingMode);
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(RESUME_URL);
      expect(res.status).toBeGreaterThanOrEqual(500);
    }
  );

  it("should handle unexpected errors gracefully", async () => {
    appDevDependencies.transactionGateway.setError(true);

    const res = await request(app).get(RESUME_URL);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });
});

