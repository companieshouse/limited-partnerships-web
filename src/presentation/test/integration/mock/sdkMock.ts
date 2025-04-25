import { LimitedPartnershipsService } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";
import { RefreshTokenService } from "@companieshouse/api-sdk-node/dist/services/refresh-token";
import { PostcodeLookupService } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";

import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { companyProfile } from "../../../../infrastructure/gateway/companyProfile/CompanyInMemoryGateway";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";

// Transaction service
export const postTransaction = jest.fn().mockImplementation(() => ({
  httpStatusCode: 201,
  resource: {
    id: appDevDependencies.transactionGateway.transactionId
  }
}));
export const putTransaction = jest.fn().mockImplementation(() => ({
  httpStatusCode: 204,
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
  resource: companyProfile
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
  }
};

export default sdkMock;
