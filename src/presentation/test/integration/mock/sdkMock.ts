import { LimitedPartnershipsService } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";
import { RefreshTokenService } from "@companieshouse/api-sdk-node/dist/services/refresh-token";

import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { PostcodeLookupService } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

// Transaction service
export const postTransaction = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: {
    id: appDevDependencies.transactionGateway.transactionId
  }
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
  resource: new LimitedPartnershipBuilder()
    .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
    .build()
}));
export const postLimitedPartnershipIncorporation = jest
  .fn()
  .mockImplementation(() => ({
    httpStatusCode: 201,
    resource: {
      id: appDevDependencies.incorporationGateway.incorporationId
    }
  }));

// Refresh Token service
export const refresh = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: { access_token: "access_token" }
}));

// Postcode Look Up service
export const isValidUKPostcode = jest.fn().mockImplementation(() => true);
export const getListOfValidPostcodeAddresses = jest
  .fn()
  .mockImplementation(() => ({
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

const sdkMock = {
  transaction: {
    ...TransactionService.prototype,
    postTransaction
  },
  limitedPartnershipsService: {
    ...LimitedPartnershipsService.prototype,
    postLimitedPartnership,
    patchLimitedPartnership,
    getLimitedPartnership,
    postLimitedPartnershipIncorporation
  },
  refreshToken: {
    ...RefreshTokenService.prototype,
    refresh
  },
  postCodeLookup: {
    ...PostcodeLookupService.prototype,
    isValidUKPostcode,
    getListOfValidPostcodeAddresses
  }
};

export default sdkMock;
