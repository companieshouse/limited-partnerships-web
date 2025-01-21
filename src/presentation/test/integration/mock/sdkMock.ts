import { LimitedPartnershipsService } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";
import { RefreshTokenService } from "@companieshouse/api-sdk-node/dist/services/refresh-token";

import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { PostcodeLookupService } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

// Postcode Look Up
export const isValidUKPostcode = jest.fn().mockImplementation(() => true);
export const getListOfValidPostcodeAddresses = jest
  .fn()
  .mockImplementation(() => [
    {
      postcode: "ST6 3LJ",
      premise: "2",
      addressLine1: "DUNCALF STREET",
      addressLine2: "",
      postTown: "STOKE-ON-TRENT",
      country: "GB-ENG"
    }
  ]);

const sdkMock = {
  transaction: {
    ...TransactionService.prototype,
    postTransaction: () => ({
      httpStatusCode: 201,
      resource: {
        id: appDevDependencies.transactionGateway.transactionId
      }
    })
  },
  limitedPartnershipsService: {
    ...LimitedPartnershipsService.prototype,
    postLimitedPartnership: () => ({
      httpStatusCode: 201,
      resource: {
        id: appDevDependencies.limitedPartnershipGateway.submissionId
      }
    }),
    patchLimitedPartnership: () => ({
      httpStatusCode: 200,
      resource: {}
    }),
    getLimitedPartnership: () => ({
      httpStatusCode: 200,
      resource: new LimitedPartnershipBuilder().build()
    })
  },
  refreshToken: {
    ...RefreshTokenService.prototype,
    refresh: {
      httpStatusCode: 201,
      resource: { access_token: "access_token" }
    }
  },
  postCodeLookup: {
    ...PostcodeLookupService.prototype,
    isValidUKPostcode,
    getListOfValidPostcodeAddresses
  }
};

export default sdkMock;
