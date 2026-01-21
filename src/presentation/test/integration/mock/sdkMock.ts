import { LimitedPartnershipsService } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";
import { RefreshTokenService } from "@companieshouse/api-sdk-node/dist/services/refresh-token";
import { PostcodeLookupService } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import CompanyOfficersService from "@companieshouse/api-sdk-node/dist/services/company-officers/service";
import { PaymentService } from "@companieshouse/api-sdk-node/dist/services/payment";
import CompanyFilingHistoryService from "@companieshouse/api-sdk-node/dist/services/company-filing-history/service";

import { appDevDependencies } from "../../../../config/dev-dependencies";

import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import CompanyAppointmentBuilder from "../../builder/CompanyAppointmentBuilder";
import FilingHistoryBuilder from "../../builder/FilingHistoryBuilder";

// Transaction service
export const postTransaction = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: {
    id: appDevDependencies.transactionGateway.transactionId
  }
}));
export const putTransaction = jest.fn().mockImplementation(() => ({
  httpStatusCode: 204,
  headers: { "x-payment-required": "/abc" },
  resource: {}
}));

// Limited Partnerships Service
export const postLimitedPartnership = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: {
    id: appDevDependencies.limitedPartnershipGateway.submissionId
  }
}));
export const patchLimitedPartnership = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: {}
}));
export const getLimitedPartnership = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: new LimitedPartnershipBuilder().withId(appDevDependencies.limitedPartnershipGateway.submissionId).build()
}));
export const postLimitedPartnershipIncorporation = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: {
    id: appDevDependencies.incorporationGateway.incorporationId
  }
}));

// General Partner
export const postGeneralPartner = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: {
    id: appDevDependencies.generalPartnerGateway.generalPartnerId
  }
}));
export const getGeneralPartner = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: new GeneralPartnerBuilder()
    .isPerson()
    .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
    .build()
}));
export const getGeneralPartners = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: [
    new GeneralPartnerBuilder().isPerson().withId(appDevDependencies.generalPartnerGateway.generalPartnerId).build()
  ]
}));
export const patchGeneralPartner = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: {}
}));
export const deleteGeneralPartner = jest.fn().mockImplementation(() => ({
  httpStatusCode: 204,
  resource: {}
}));

// Limited Partner
export const postLimitedPartner = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: {
    id: appDevDependencies.limitedPartnerGateway.limitedPartnerId
  }
}));
export const getLimitedPartner = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: new LimitedPartnerBuilder()
    .isPerson()
    .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
    .build()
}));
export const getLimitedPartners = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: [
    new LimitedPartnerBuilder().isPerson().withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId).build()
  ]
}));
export const patchLimitedPartner = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: {}
}));
export const deleteLimitedPartner = jest.fn().mockImplementation(() => ({
  httpStatusCode: 204,
  resource: {}
}));

// Refresh Token service
export const refresh = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: { access_token: "access_token" }
}));

// Postcode Look Up service
export const isValidUKPostcode = jest.fn().mockImplementation(() => true);
export const getListOfValidPostcodeAddresses = jest.fn().mockImplementation(() => ({
  resource: [
    {
      postcode: "ST6 3LJ",
      premise: "2",
      addressLine1: "DUNCALF STREET",
      addressLine2: "",
      postTown: "STOKE-ON-TRENT",
      country: "GB-ENG"
    }
  ]
}));

// Company Profile service
export const getCompanyProfile = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: new CompanyProfileBuilder().build().data
}));

// Company Officers service
export const getCompanyAppointment = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: new CompanyAppointmentBuilder().build()
}));

export const getCompanyOfficers = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: [new GeneralPartnerBuilder().isPerson().build(), new LimitedPartnerBuilder().isLegalEntity().build()]
}));

// Payment Service

export const createPaymentWithFullUrl = jest.fn().mockImplementation(() => ({
  isSuccess: () => true,
  isFailure: () => false,
  value: {
    httpStatusCode: 201,
    resource: {
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
    }
  }
}));

export const getCompanyFilingHistory = jest.fn().mockImplementation(() => ({
  httpStatusCode: 200,
  resource: {
    filing_history_status: "filing-history-available-limited-partnership-from-2014",
    items: [new FilingHistoryBuilder().build()],
    items_per_page: 25,
    start_index: 0,
    total_count: 1
  }
}));

const sdkMock = {
  transaction: {
    ...TransactionService.prototype,
    postTransaction,
    putTransaction
  },
  limitedPartnershipsService: {
    ...LimitedPartnershipsService.prototype,
    postLimitedPartnership,
    patchLimitedPartnership,
    getLimitedPartnership,
    postLimitedPartnershipIncorporation,
    postGeneralPartner,
    getGeneralPartner,
    getGeneralPartners,
    patchGeneralPartner,
    deleteGeneralPartner,
    postLimitedPartner,
    getLimitedPartner,
    getLimitedPartners,
    patchLimitedPartner,
    deleteLimitedPartner
  },
  refreshToken: {
    ...RefreshTokenService.prototype,
    refresh
  },
  postCodeLookup: {
    ...PostcodeLookupService.prototype,
    isValidUKPostcode,
    getListOfValidPostcodeAddresses
  },
  companyProfile: {
    ...CompanyProfileService.prototype,
    getCompanyProfile
  },
  companyOfficers: {
    ...CompanyOfficersService.prototype,
    getCompanyOfficers,
    getCompanyAppointment
  },
  payment: {
    ...PaymentService.prototype,
    createPaymentWithFullUrl
  },
  companyFilingHistory: {
    ...CompanyFilingHistoryService.prototype,
    getCompanyFilingHistory
  }
};

export default sdkMock;
