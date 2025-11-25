import request from "supertest";
import app from "../app";

import { appDevDependencies } from "../../../../config/dev-dependencies";
import {
  PAYMENT_RESPONSE_URL,
  RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL,
  RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL,
  RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL,
  RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL
} from "../../../../presentation/controller/global/url";
import { PARTNERSHIP_TYPE_WITH_IDS_URL } from "../../../../presentation/controller/registration/url";
import { EMAIL_URL } from "../../../../presentation/controller/transition/url";
import { getUrl } from "../../utils";
import { CHS_URL, JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";
import { TransactionKind, TransactionStatus } from "../../../../domain/entities/TransactionTypes";
import TransactionBuilder from "../../../../presentation/test/builder/TransactionBuilder";
import { PartnerKind, PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
  PARTNERSHIP_NAME_WITH_IDS_URL,
  TERM_WITH_IDS_URL
} from "presentation/controller/postTransition/url";

describe("Resume a journey", () => {
  const RESUME_REGISTRATION_OR_TRANSITION_URL = getUrl(RESUME_JOURNEY_REGISTRATION_OR_TRANSITION_URL);
  const RESUME_POST_TRANSITION_GENERAL_PARTNER_URL = getUrl(RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL);
  const RESUME_POST_TRANSITION_LIMITED_PARTNER_URL = getUrl(RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL);
  const RESUME_POST_TRANSITION_PARTNERSHIP_URL = getUrl(RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL);

  beforeEach(() => {
    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.transactionGateway.setError(false);
    // Clear previous requests
    appDevDependencies.paymentGateway.lastCreatePaymentRequest = undefined;
  });

  it.each([
    {
      filingMode: TransactionKind.registration,
      expectedLocation: getUrl(PARTNERSHIP_TYPE_WITH_IDS_URL)
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

    const res = await request(app).get(RESUME_REGISTRATION_OR_TRANSITION_URL);

    expect(res.status).toEqual(302);
    expect(res.headers.location).toEqual(expectedLocation);
  });

  it.each([
    {
      resumeUrl: RESUME_POST_TRANSITION_GENERAL_PARTNER_URL,
      resourceKind: PartnerKind.ADD_GENERAL_PARTNER_PERSON,
      expectedLocation: getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL)
    },
    {
      resumeUrl: RESUME_POST_TRANSITION_GENERAL_PARTNER_URL,
      resourceKind: PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY,
      expectedLocation: getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL)
    },
    {
      resumeUrl: RESUME_POST_TRANSITION_LIMITED_PARTNER_URL,
      resourceKind: PartnerKind.ADD_LIMITED_PARTNER_PERSON,
      expectedLocation: getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL)
    },
    {
      resumeUrl: RESUME_POST_TRANSITION_LIMITED_PARTNER_URL,
      resourceKind: PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY,
      expectedLocation: getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL)
    },
    {
      resumeUrl: RESUME_POST_TRANSITION_PARTNERSHIP_URL,
      resourceKind: PartnershipKind.UPDATE_PARTNERSHIP_NAME,
      expectedLocation: getUrl(PARTNERSHIP_NAME_WITH_IDS_URL)
    },
    {
      resumeUrl: RESUME_POST_TRANSITION_PARTNERSHIP_URL,
      resourceKind: PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS,
      expectedLocation: getUrl(ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL)
    },
    {
      resumeUrl: RESUME_POST_TRANSITION_PARTNERSHIP_URL,
      resourceKind: PartnershipKind.UPDATE_PARTNERSHIP_TERM,
      expectedLocation: getUrl(TERM_WITH_IDS_URL)
    },
    {
      resumeUrl: RESUME_POST_TRANSITION_PARTNERSHIP_URL,
      resourceKind: PartnershipKind.UPDATE_PARTNERSHIP_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS,
      expectedLocation: getUrl(ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL)
    }
  ])(
    "should resume a no payment post-transition $resourceKind journey",
    async ({ resumeUrl, resourceKind, expectedLocation }) => {
      const resources = {
        "limited-partnership/someResource": {
          kind: resourceKind,
          links: {
            resource: ""
          }
        }
      };

      const transaction = new TransactionBuilder()
        .withFilingMode(TransactionKind.postTransition)
        .withCompanyName("Test Company")
        .withCompanyNumber("LP123456")
        .withResources(resources)
        .build();

      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(resumeUrl);

      expect(res.status).toEqual(302);
      expect(res.headers.location).toEqual(expectedLocation);
    }
  );

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

    const res = await request(app).get(RESUME_REGISTRATION_OR_TRANSITION_URL);

    expect(res.status).toEqual(302);
    expect(res.headers.location).toEqual(appDevDependencies.paymentGateway.payment.links.journey);

    // Assert the payment return Url
    expect(appDevDependencies.paymentGateway.lastCreatePaymentRequest?.redirectUri).toEqual(expectedPaymentReturnUrl);
  });

  it.each([
    { filingMode: undefined as unknown as string, description: "undefined" },
    { filingMode: "", description: "empty string" },
    { filingMode: "invalid", description: "invalid string" }
  ])("should throw error if transaction filing mode is $description", async ({ filingMode }) => {
    const transaction = new TransactionBuilder()
      .withFilingMode(filingMode)
      .withCompanyName("Test Company")
      .withCompanyNumber("LP123456")
      .build();

    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const res = await request(app).get(RESUME_REGISTRATION_OR_TRANSITION_URL);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it.each([
    { withResources: {} },
    { withResources: undefined as unknown as object },
    { withResources: { resource: { kind: undefined as unknown as string } } },
    { withResources: { resource: { kind: "unknown" as unknown as string } } }
  ])("should throw error if post transition resources or kind are missing", async ({ withResources }) => {
    const transaction = new TransactionBuilder()
      .withFilingMode(TransactionKind.postTransition)
      .withCompanyName("Test Company")
      .withCompanyNumber("LP123456")
      .withResources(withResources)
      .build();

    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const res = await request(app).get(RESUME_POST_TRANSITION_GENERAL_PARTNER_URL);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it("should handle unexpected errors", async () => {
    appDevDependencies.transactionGateway.setError(true);

    const res = await request(app).get(RESUME_REGISTRATION_OR_TRANSITION_URL);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it("should throw error if no resume mapping exists", async () => {
    const transaction = new TransactionBuilder()
      .withFilingMode("something-else")
      .withCompanyName("Test Company")
      .withCompanyNumber("LP123456")
      .build();

    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const res = await request(app).get(RESUME_POST_TRANSITION_GENERAL_PARTNER_URL);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });
});
