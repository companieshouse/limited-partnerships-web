import request from "supertest";
import app from "../app";

import { appDevDependencies } from "../../../../config/dev-dependencies";
import { PAYMENT_RESPONSE_URL, RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL } from "../../../../presentation/controller/global/url";
import { WHICH_TYPE_WITH_IDS_URL } from "../../../../presentation/controller/registration/url";
import { EMAIL_URL } from "../../../../presentation/controller/transition/url";
import { getUrl } from "../../utils";
import { CHS_URL, JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";
import { TransactionKind, TransactionStatus } from "../../../../domain/entities/TransactionTypes";
import TransactionBuilder from "presentation/test/builder/TransactionBuilder";

describe("Resume a journey", () => {
  const RESUME_URL = getUrl(RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL);

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
      expectedLocation: getUrl(EMAIL_URL)
    }
  ])("should resume a no payment $filingMode journey", async ({ filingMode, expectedLocation }) => {
    const transaction = new TransactionBuilder()
      .withFilingMode(filingMode)
      .withCompanyName("Test Company")
      .withCompanyNumber("LP123456")
      .build();

    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const res = await request(app).get(RESUME_URL);

    expect(res.status).toEqual(302);
    expect(res.headers.location).toEqual(expectedLocation);
  });

  it.each([
    {
      filingMode: TransactionKind.registration,
      expectedPaymentReturnUrl: getUrl(`${CHS_URL}${PAYMENT_RESPONSE_URL}`).replace(
        JOURNEY_TYPE_PARAM,
        Journey.registration
      )
    },
    {
      filingMode: TransactionKind.transition,
      expectedPaymentReturnUrl: getUrl(`${CHS_URL}${PAYMENT_RESPONSE_URL}`).replace(
        JOURNEY_TYPE_PARAM,
        Journey.transition
      )
    }
  ])("should resume a pay now $filingMode journey", async ({ filingMode, expectedPaymentReturnUrl }) => {
    const transaction = new TransactionBuilder()
      .withFilingMode(filingMode)
      .withCompanyName("Test Company")
      .withCompanyNumber("LP123456")
      .withStatus(TransactionStatus.closedPendingPayment)
      .build();

    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const res = await request(app).get(RESUME_URL);

    expect(res.status).toEqual(302);
    expect(res.headers.location).toEqual(appDevDependencies.paymentGateway.payment.links.journey);

    // Assert the payment return Url
    expect(appDevDependencies.paymentGateway.lastCreatePaymentRequest?.redirectUri).toEqual(expectedPaymentReturnUrl);
  });

  it.each([
    { filingMode: undefined as unknown as string, description: "undefined" },
    { filingMode: "", description: "empty string" }
  ])("should throw error if transaction filing mode is $description", async ({ filingMode }) => {
    const transaction = new TransactionBuilder()
      .withFilingMode(filingMode)
      .withCompanyName("Test Company")
      .withCompanyNumber("LP123456")
      .build();

    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const res = await request(app).get(RESUME_URL);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it("should handle unexpected errors", async () => {
    appDevDependencies.transactionGateway.setError(true);

    const res = await request(app).get(RESUME_URL);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });
});
